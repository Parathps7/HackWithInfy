const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config();
const asyncHandler = require('express-async-handler')
const Conversation = require("../models/convHistoryModel")
const User = require("../models/userModel")

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
max_tokens: 8000,
temperature: 0.7,
top_k: 250,
top_p: 0.999,
stop_sequences: ["\n\nHuman:"]
};

let conversationHistory = [];

async function generateClaudeResponse(userMessage) {
const messages = [
...conversationHistory,
{ role: "user", content: [{ type: "text", text: userMessage }] }
];

const body = {
anthropic_version: "bedrock-2023-05-31",
// prompt engineering
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

const chatBotController = asyncHandler(async (req, res) => {
const userMessage = req.body.message;
const userId = req.user.id;
const conversationId = req.body.conversationID;
const user = await User.findOne({ phoneNumber:userId }).select('_id');
// console.log(user);
if( !conversationId )res.status(400).send({"message":"Provide ConversationID"});

const conversation = await Conversation.findOne({user, conversationId});
if( conversation){
conversationHistory = conversation.conversationHistory;
}
if (!userMessage) {
return res.status(400).json({ error: "Message is required" });
}

const claudeResponse = await generateClaudeResponse(userMessage);

// Update conversation history
conversationHistory.push(
{ role: "user", content: [{ type: "text", text: userMessage }] },
{ role: "assistant", content: [{ type: "text", text: claudeResponse }] }
);
// console.log(user)
await Conversation.findOneAndUpdate(
{ userId:user._id, conversationId }, // Query criteria
{ $set: { conversationHistory } }, // Update operation
{ upsert: true, new: true } // Options
);
res.json({ response: claudeResponse });
});

const summary = asyncHandler(async (req,res) => {
// prompt engineering
const summaryprompt = "Give summary";
if( conversationHistory.length === 0 )res.json({"message":"No data to make summary"})
const claudeResponse = await generateClaudeResponse(summaryprompt);
res.json({ response: claudeResponse });
}
);




module.exports = {chatBotController, summary };
