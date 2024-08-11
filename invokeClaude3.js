const express = require('express');
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config();

const app = express();
const port = 3000;

// AWS and Bedrock configuration
const REGION = process.env.AWS_REGION || "us-east-1";
const bedrockClient = new BedrockRuntimeClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0";
const MODEL_KWARGS = {
  max_tokens: 2048,
  temperature: 0.7,
  top_k: 250,
  top_p: 0.999,
  stop_sequences: ["\n\nHuman:"]
};

app.use(express.json());

let conversationHistory = [];

async function generateClaudeResponse(userMessage) {
  const messages = [
    ...conversationHistory,
    { role: "user", content: [{ type: "text", text: userMessage }] }
  ];

  const body = {
    anthropic_version: "bedrock-2023-05-31",
    system: "You are Claude, an AI assistant created by Anthropic to be helpful, harmless, and honest.",
    messages: messages,
    ...MODEL_KWARGS
  };

  const params = {
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body)
  };

  try {
    const command = new InvokeModelCommand(params);
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    console.error("Error:", error);
    return "I apologize, but I encountered an error while processing your request.";
  }
}

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  
  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  const claudeResponse = await generateClaudeResponse(userMessage);
  
  // Update conversation history
  conversationHistory.push(
    { role: "user", content: [{ type: "text", text: userMessage }] },
    { role: "assistant", content: [{ type: "text", text: claudeResponse }] }
  );

  // Keep only the last 10 messages to manage context length
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }

  res.json({ response: claudeResponse });
});

app.listen(port, () => {
  console.log(`Chatbot server listening at http://localhost:${port}`);
});