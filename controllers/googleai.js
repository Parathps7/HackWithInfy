const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require('readline');
const asyncHandler = require('express-async-handler');
require('dotenv').config();

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});




// Initialize conversation history
let conversationHistory = [];

const chat = asyncHandler(async (req, res) => {
    const content = req.body.message;
    const transcript = req.body.transcript;
  
    if (!conversationHistory[0]) {
      conversationHistory.push({ role: 'user', parts: [{ text: transcript }] });
      conversationHistory.push({ role: 'user', parts: [{ text: "Whenever I ask a question related to previous transcript, send me the timestamp where I can find the relevant answer also at the end." }] });
    }
  
    conversationHistory.push({ role: 'user', parts: [{ text: content }] });
  
    try {
      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  
      // Start a chat session
      const chat = model.startChat({
        history: conversationHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });
  
      // Send the message and get the response
      const result = await chat.sendMessage(content);
      const response = await result.response;
      const assistantResponse = await response.text();
  
      // Add assistant response to conversation history
      conversationHistory.push({ role: 'model', parts: [{ text: assistantResponse }] });
  
      // Structure the assistant's response
      const structuredResponse = {
        message: assistantResponse.trim(),
        timestamp: "0:00:48.960-0:00:51.120", // Example timestamp, should be parsed or dynamically provided
        explanation: "The \"wall of confusion\" refers to the separation and lack of collaboration between development and operations teams in traditional software development. This \"wall\" leads to misunderstandings, delays, and inefficiencies because the teams are working in silos instead of as a unified force."
      };
  
      // Send structured response
      res.status(200).send({ Assistant: structuredResponse });
    } catch (error) {
      console.error('Error calling Google AI API:', error.message);
      res.status(400).send({ Error: error.message });
    }
  });
  

const segmentTranscript = asyncHandler (async (req, res) => {
    const transcript = req.body.transcript;
  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `Divide the following transcript into logical segments that cover a topic completely with timestamps and time duration of each segment should at least 3 minutes long. Only send Segement number,segement name and segement time stamps.Only print these things and nothing else, no explainations, and each segement should be at least 2 minutes long, if not make one segement only.:\n\n${transcript}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const segTrans =  response.text().trim().split('\n\n');
    // console.log(segTrans)
    // const parsedString =parseSegments(segTrans)

    res.status(200).send({ 'Segments': segTrans });
  } catch (error) {
    console.error("Error segmenting transcript:", error.message);
    res.status(400).send({'error': error.message})
  }
});


const segmentTrivia = asyncHandler(async (req, res) => {
    const transcript = req.body.trivia;
    try {
      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  
      const prompt = `Based on the following transcript generate a random interesting fact or joke related to the segment. Also provide the timestamp for it. Send it in form of json. Do not show the segment information.:\n\n${transcript}`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log('sbkhas');
      let str = response.text().trim();
      const start = str.indexOf('{');
      const end = str.lastIndexOf('}');
      
      // Extract the substring between '{' and '}'
      const jsonString = str.substring(start, end + 1);
      
      // Parse the JSON string into an object
      const parsedData = JSON.parse(jsonString);
      
      // Send the parsed data as the response
      res.status(200).json(parsedData);
    } catch (error) {
      console.error("Error segmenting transcript:", error.message);
      res.status(400).send(error.message);
    }
  });

  
  const segmentQuiz = asyncHandler(async (req, res) => {
    const transcript = req.body.transcript;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    
    try {
      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  
      const prompt = `Based on the following transcript generate some mcq questions. 
      Options should be in key value pair. Send it in form of json. Should be of the format
      [{"question":"question statement","options":{"A":"Option 1", "B":"Option 2", "C": "Option 3", "D":"Option 4"},
      "answer":"C"},{"question":"question statement 2","options":{"A":"Option 1 some statement", "B":"Option 2 some statement", "C": "Option 3 some statement", "D":"Option 4 some statement"},
      "answer":"B"}]
      Do not show the segment information.:\n\n${transcript}`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      let str = response.text().trim();
      
      // Parse the entire response as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(str);
      } catch (parseError) {
        // If parsing fails, try to extract JSON from the string
        const start = str.indexOf('[');
        const end = str.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
          const jsonString = str.substring(start, end + 1);
          parsedData = JSON.parse(jsonString);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }
  
      // Ensure parsedData is an array
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }
  
      // Send the structured data
      res.status(200).json(parsedData);
    } catch (error) {
      console.error("Error generating quiz:", error);
      res.status(400).json({ 
        error: "Failed to generate quiz. Please try again.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  const summary = asyncHandler(async (req, res) => {
    const transcript = req.body.transcript;
    const content = "Generate a summary topicwise and segementwise.Make it a little explained and keep all important points, along with timestamps where they occur.Give in list of json form,json should have title, explaination, timestamp.Donot give ```json in response"
    try {
      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  
      // Start a chat session
      const chat = model.startChat({
        history: [{ role: 'user', parts: [{ text: transcript }] }],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });
  
      // Send the message and get the response
      const result = await chat.sendMessage(content);
      const response = await result.response;
      const assistantResponse = await response.text();
  
      // Send structured response
      res.status(200).send({ Assistant: assistantResponse });
    } catch (error) {
      console.error('Error calling Google AI API:', error.message);
      res.status(400).send({ Error: error.message });
    }
  });


module.exports = { chat, segmentTranscript, segmentQuiz, segmentTrivia, summary };