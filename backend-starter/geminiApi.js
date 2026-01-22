// geminiApi.js
// Integration with Google Gemini AI API for real conversation responses

const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
let client = null;

// Initialize Gemini client
function initializeGemini() {
  if (!apiKey) {
    console.warn("⚠️  GEMINI_API_KEY not found in environment. Using mock responses.");
    return null;
  }

  try {
    client = new GoogleGenerativeAI(apiKey);
    console.log("✅ Gemini API initialized successfully");
    return client;
  } catch (error) {
    console.error("❌ Failed to initialize Gemini API:", error.message);
    return null;
  }
}

// Generate response using Gemini
async function generateGeminiResponse(conversationMessages, systemPrompt = "") {
  if (!client) {
    return null;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-pro" });

    // Format messages for Gemini
    const chatHistory = conversationMessages
      .filter(msg => msg.role !== "system")
      .map(msg => ({
        role: msg.role === "customer" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    // Create chat session
    const chat = model.startChat({
      history: chatHistory.slice(0, -1), // Exclude the last message for chat context
    });

    // Get the last user message
    const lastMessage = conversationMessages
      .reverse()
      .find(msg => msg.role === "customer")?.content || "";

    if (!lastMessage) {
      return null;
    }

    // Generate response
    const systemInstructions =
      systemPrompt ||
      `You are a helpful customer service representative. You are professional, empathetic, and solution-oriented. 
    Keep your responses concise and clear. Always try to help resolve customer issues.`;

    const result = await chat.sendMessage(
      `System Instructions: ${systemInstructions}\n\nCustomer message: ${lastMessage}`
    );

    const response = result.response.text();

    // Calculate mock metrics (sentiment analysis would require additional API calls)
    const metrics = {
      responseTime: Math.random() * 2 + 0.5, // 0.5-2.5 seconds
      confidenceScore: 0.85 + Math.random() * 0.15, // 85-100%
      sentiment: null,
    };

    return {
      response,
      metrics,
      source: "gemini",
    };
  } catch (error) {
    console.error("❌ Gemini API error:", error.message);
    return null;
  }
}

// Analyze sentiment using Gemini
async function analyzeSentimentWithGemini(text) {
  if (!client) {
    return null;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze the sentiment of the following text and respond with ONLY a JSON object in this format:
{
  "sentiment": <number between -1 and 1, where -1 is very negative, 0 is neutral, and 1 is very positive>,
  "emotion": "<emotion like happy, sad, angry, neutral, etc>",
  "intensity": <number between 0 and 1 indicating intensity>,
  "keywords": [<list of emotional keywords found>]
}

Text: "${text}"

ONLY respond with the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      // Extract JSON from response (might have extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const sentimentData = JSON.parse(jsonMatch[0]);
        return {
          sentiment: sentimentData.sentiment,
          analysis: {
            emotion: sentimentData.emotion,
            intensity: sentimentData.intensity,
            keywords: sentimentData.keywords,
          },
          source: "gemini",
        };
      }
    } catch (parseError) {
      console.error("Error parsing sentiment response:", parseError.message);
    }

    return null;
  } catch (error) {
    console.error("❌ Gemini sentiment analysis error:", error.message);
    return null;
  }
}

// Retrieve knowledge/information using Gemini
async function retrieveKnowledgeWithGemini(query, context = "") {
  if (!client) {
    return null;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a knowledge base search engine. Based on the query, provide relevant information.
${context ? `Context: ${context}` : ""}

Query: "${query}"

Provide a concise, relevant response.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return {
      results: [
        {
          id: "gemini-1",
          title: "Search Result",
          content: response,
          relevance: 0.95,
          source: "gemini",
        },
      ],
      source: "gemini",
    };
  } catch (error) {
    console.error("❌ Gemini knowledge retrieval error:", error.message);
    return null;
  }
}

// Initialize on module load
initializeGemini();

module.exports = {
  generateGeminiResponse,
  analyzeSentimentWithGemini,
  retrieveKnowledgeWithGemini,
  isGeminiAvailable: () => client !== null,
};
