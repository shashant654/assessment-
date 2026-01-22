const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const Agent = require("../models/agent");
const { simulateDelay } = require("../utils/helpers");

// Get analytics summary
router.get("/", async (req, res, next) => {
  try {
    const { timeRange = "today" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    // Get conversations within the time range
    const conversations = await Conversation.find({
      startTime: { $gte: startDate },
    });

    // Calculate metrics
    const totalConversations = conversations.length;
    const resolvedConversations = conversations.filter(
      (c) => c.status === "resolved",
    ).length;
    const escalatedConversations = conversations.filter(
      (c) => c.status === "escalated",
    ).length;

    const avgResponseTime =
      conversations.length > 0
        ? conversations.reduce(
            (sum, c) => sum + (c.metrics?.responseTime || 0),
            0,
          ) / conversations.length
        : 0;

    const avgSentiment =
      conversations.length > 0
        ? conversations.reduce(
            (sum, c) => sum + (c.metrics?.sentiment || 0),
            0,
          ) / conversations.length
        : 0;

    // Group conversations by day for trend data
    const dailyData = {};
    conversations.forEach((conv) => {
      const date = new Date(conv.startTime).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          conversations: 0,
          resolved: 0,
          escalated: 0,
          avgSentiment: 0,
          totalSentiment: 0,
        };
      }
      dailyData[date].conversations++;
      if (conv.status === "resolved") dailyData[date].resolved++;
      if (conv.status === "escalated") dailyData[date].escalated++;
      dailyData[date].totalSentiment += conv.metrics?.sentiment || 0;
    });

    // Calculate average sentiment per day
    const daily = Object.values(dailyData)
      .map((day) => ({
        ...day,
        avgSentiment:
          day.conversations > 0 ? day.totalSentiment / day.conversations : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get agent performance
    const agents = await Agent.find();

    await simulateDelay(400);

    res.json({
      summary: {
        totalConversations,
        resolvedConversations,
        escalatedConversations,
        resolutionRate:
          totalConversations > 0
            ? resolvedConversations / totalConversations
            : 0,
        escalationRate:
          totalConversations > 0
            ? escalatedConversations / totalConversations
            : 0,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        avgSentiment: Math.round(avgSentiment * 100) / 100,
      },
      daily,
      agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        metrics: agent.metrics || {},
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Get conversation trends
router.get("/trends", async (req, res, next) => {
  try {
    const { metric = "volume", days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const conversations = await Conversation.find({
      startTime: { $gte: startDate },
    }).sort({ startTime: 1 });

    // Group by day
    const trends = [];
    const dateMap = {};

    conversations.forEach((conv) => {
      const date = new Date(conv.startTime).toISOString().split("T")[0];
      if (!dateMap[date]) {
        dateMap[date] = {
          date,
          count: 0,
          sentiment: [],
          responseTime: [],
          escalations: 0,
        };
      }

      dateMap[date].count++;
      if (conv.metrics?.sentiment)
        dateMap[date].sentiment.push(conv.metrics.sentiment);
      if (conv.metrics?.responseTime)
        dateMap[date].responseTime.push(conv.metrics.responseTime);
      if (conv.status === "escalated") dateMap[date].escalations++;
    });

    Object.values(dateMap).forEach((day) => {
      const avgSentiment =
        day.sentiment.length > 0
          ? day.sentiment.reduce((a, b) => a + b, 0) / day.sentiment.length
          : 0;
      const avgResponseTime =
        day.responseTime.length > 0
          ? day.responseTime.reduce((a, b) => a + b, 0) /
            day.responseTime.length
          : 0;

      trends.push({
        date: day.date,
        volume: day.count,
        sentiment: Math.round(avgSentiment * 100),
        responseTime: Math.round(avgResponseTime * 10) / 10,
        escalationRate: day.count > 0 ? (day.escalations / day.count) * 100 : 0,
      });
    });

    await simulateDelay(300);

    res.json(trends);
  } catch (error) {
    next(error);
  }
});

// Get top issues
router.get("/top-issues", async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const conversations = await Conversation.find();

    // Count tag frequency
    const tagCounts = {};
    conversations.forEach((conv) => {
      (conv.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort and limit
    const topIssues = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit));

    await simulateDelay(250);

    res.json(topIssues);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
