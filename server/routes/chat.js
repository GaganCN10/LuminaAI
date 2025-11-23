// routes/chat.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const { 
  chatWithAI, 
  getConversationHistory, 
  clearConversation 
} = require("../controllers/chatController");

// Send a message to the AI
router.post("/", protect, chatWithAI);

// Get conversation history (conversationId is now required)
router.get("/history/:conversationId", protect, getConversationHistory);

// Clear conversation (conversationId is now required)
router.delete("/clear/:conversationId", protect, clearConversation);

module.exports = router;