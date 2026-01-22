// src/pages/Analysis.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Divider,
  VStack,
  HStack,
  Select,
  Button,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from '@chakra-ui/react';
import { FiDownload, FiFilter, FiTrendingUp } from 'react-icons/fi';
import { useAppData } from '../context/AppDataContext';

const Analysis = () => {
  const { conversations, agents } = useAppData();
  const [timeRange, setTimeRange] = useState('week');
  const cardBg = useColorModeValue('white', 'gray.800');
  const itemBg = useColorModeValue('gray.50', 'gray.700');

  // Calculate statistics
  const stats = {
    totalConversations: conversations.length,
    activeConversations: conversations.filter(c => c.status === 'active').length,
    resolvedConversations: conversations.filter(c => c.status === 'resolved').length,
    escalatedConversations: conversations.filter(c => c.status === 'escalated').length,
    avgResponseTime: conversations.length > 0
      ? (conversations.reduce((sum, c) => sum + (c.metrics?.responseTime || 0), 0) / conversations.length).toFixed(1)
      : 0,
    avgSentiment: conversations.length > 0
      ? (conversations.reduce((sum, c) => sum + (c.metrics?.sentiment || 0), 0) / conversations.length).toFixed(2)
      : 0,
    avgConfidence: conversations.length > 0
      ? (conversations.reduce((sum, c) => sum + (c.metrics?.confidenceScore || 0), 0) / conversations.length * 100).toFixed(1)
      : 0,
  };

  const topIssues = conversations
    .flatMap(c => c.tags || [])
    .reduce((acc, tag) => {
      const existing = acc.find(t => t.tag === tag);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ tag, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const agentPerformance = agents.map(agent => ({
    name: agent.name,
    conversations: agent.metrics?.conversations || 0,
    avgResponseTime: agent.metrics?.avgResponseTime || 0,
    satisfaction: (agent.metrics?.satisfaction || 0) * 100,
    escalationRate: (agent.metrics?.escalationRate || 0) * 100,
  }));

  return (
    <Box>
      <Box mb={6}>
        <Heading size={{ base: 'md', md: 'lg' }}>Analytics & Analysis</Heading>
        <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
          View conversation trends, agent performance, and common issues
        </Text>
      </Box>

      {/* Time Range Selector */}
      <HStack mb={6} spacing={2}>
        <Text fontSize="sm" fontWeight="bold">Time Range:</Text>
        <Select
          size="sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          maxW="200px"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </Select>
      </HStack>

      {/* Key Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card bg={cardBg}>
          <CardBody>
            <Text fontSize="sm" color="gray.500" mb={1}>Total Conversations</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.totalConversations}</Text>
            <Text fontSize="xs" color="blue.500" mt={2}>Active: {stats.activeConversations}</Text>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Text fontSize="sm" color="gray.500" mb={1}>Avg Response Time</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.avgResponseTime}s</Text>
            <Text fontSize="xs" color="green.500" mt={2}>Performance target: &lt;15s</Text>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Text fontSize="sm" color="gray.500" mb={1}>Customer Satisfaction</Text>
            <Text fontSize="2xl" fontWeight="bold">{(stats.avgSentiment * 100).toFixed(0)}%</Text>
            <Text fontSize="xs" color="green.500" mt={2}>Based on sentiment</Text>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Text fontSize="sm" color="gray.500" mb={1}>Avg Confidence</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.avgConfidence}%</Text>
            <Text fontSize="xs" color="orange.500" mt={2}>AI Response confidence</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Analysis Tabs */}
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>Common Issues</Tab>
          <Tab>Agent Performance</Tab>
          <Tab>Conversation Status</Tab>
        </TabList>

        <TabPanels>
          {/* Common Issues */}
          <TabPanel>
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Top Issues by Tag</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                {topIssues.length > 0 ? (
                  <VStack align="stretch" spacing={3}>
                    {topIssues.map((issue, idx) => (
                      <HStack key={idx} justify="space-between" p={3} bg={itemBg} borderRadius="md">
                        <Text fontWeight="bold">{issue.tag}</Text>
                        <Badge colorScheme="blue">{issue.count} conversations</Badge>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">No issues tagged in conversations</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Agent Performance */}
          <TabPanel>
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Agent Performance Metrics</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  {agentPerformance.map((agent, idx) => (
                    <HStack key={idx} justify="space-between" p={4} bg={itemBg} borderRadius="md">
                      <VStack align="flex-start" spacing={1}>
                        <Text fontWeight="bold">{agent.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {agent.conversations} conversations handled
                        </Text>
                      </VStack>
                      <VStack align="flex-end" spacing={0}>
                        <HStack spacing={4}>
                          <VStack spacing={0}>
                            <Text fontSize="sm" color="gray.500">Response Time</Text>
                            <Text fontWeight="bold">{agent.avgResponseTime.toFixed(1)}s</Text>
                          </VStack>
                          <VStack spacing={0}>
                            <Text fontSize="sm" color="gray.500">Satisfaction</Text>
                            <Text fontWeight="bold" color="green.500">{agent.satisfaction.toFixed(0)}%</Text>
                          </VStack>
                          <VStack spacing={0}>
                            <Text fontSize="sm" color="gray.500">Escalation</Text>
                            <Text fontWeight="bold" color="orange.500">{agent.escalationRate.toFixed(1)}%</Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Conversation Status */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="md">Status Distribution</Heading>
                </CardHeader>
                <Divider />
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text>Active</Text>
                      <Badge colorScheme="green">{stats.activeConversations}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Resolved</Text>
                      <Badge colorScheme="blue">{stats.resolvedConversations}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Escalated</Text>
                      <Badge colorScheme="red">{stats.escalatedConversations}</Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="md">Export Options</Heading>
                </CardHeader>
                <Divider />
                <CardBody>
                  <VStack spacing={2} align="stretch">
                    <Button leftIcon={<FiDownload />} variant="outline" size="sm">
                      Download CSV Report
                    </Button>
                    <Button leftIcon={<FiDownload />} variant="outline" size="sm">
                      Download PDF Summary
                    </Button>
                    <Button leftIcon={<FiFilter />} variant="outline" size="sm">
                      Advanced Filters
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Analysis;
