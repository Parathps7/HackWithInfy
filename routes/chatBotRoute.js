const express = require("express");
const router = express.Router();
// const {chatBotController, summary} = require("../controllers/chatBotController")
const {validateToken} = require("../middlewares/validateTokenHandler")
const {chat, segmentTranscript, segmentQuiz, segmentTrivia, summary} = require('../controllers/googleai')

// router.post('/chat', validateToken, chatBotController);
router.post('/chat', chat);
router.post('/segmentTranscript', segmentTranscript);
router.post('/segementQuiz', segmentQuiz);
router.post('/segementTrivia', segmentTrivia)
router.post('/summary', validateToken, summary, summary)

module.exports = router;