// routes/templates.js
const express = require("express");
const router = express.Router();
const ResponseTemplate = require("../models/responseTemplate");
const { simulateDelay } = require("../utils/helpers");

// Get all templates with optional filtering
router.get("/", async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const templates = await ResponseTemplate.find(filter).sort({
      createdAt: -1,
    });

    await simulateDelay(200);

    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// Get a specific template by ID
router.get("/:id", async (req, res, next) => {
  try {
    const template = await ResponseTemplate.findOne({ id: req.params.id });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    await simulateDelay(150);

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Create a new template
router.post("/", async (req, res, next) => {
  try {
    const { name, category, content, variables, createdBy, isShared } =
      req.body;

    if (!name || !category || !content) {
      return res
        .status(400)
        .json({ message: "Name, category, and content are required" });
    }

    // Generate unique ID
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const template = new ResponseTemplate({
      id,
      name,
      category,
      content,
      variables: variables || [],
      createdBy: createdBy || "system",
      isShared: isShared || false,
    });

    await template.save();

    await simulateDelay(300);

    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Update a template
router.patch("/:id", async (req, res, next) => {
  try {
    const { name, category, content, variables, isShared } = req.body;

    const template = await ResponseTemplate.findOne({ id: req.params.id });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (name) template.name = name;
    if (category) template.category = category;
    if (content) template.content = content;
    if (variables !== undefined) template.variables = variables;
    if (isShared !== undefined) template.isShared = isShared;

    await template.save();

    await simulateDelay(300);

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Delete a template
router.delete("/:id", async (req, res, next) => {
  try {
    const template = await ResponseTemplate.findOne({ id: req.params.id });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    await ResponseTemplate.deleteOne({ id: req.params.id });

    await simulateDelay(250);

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Apply template with variable substitution
router.post("/:id/apply", async (req, res, next) => {
  try {
    const { variables } = req.body;

    const template = await ResponseTemplate.findOne({ id: req.params.id });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    let result = template.content;

    // Replace variables in the template
    if (variables && typeof variables === "object") {
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        result = result.replace(regex, variables[key]);
      });
    }

    await simulateDelay(150);

    res.json({
      content: result,
      originalTemplate: template.content,
      substitutions: variables || {},
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
