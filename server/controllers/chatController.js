// controllers/chatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const HEALTHCARE_SYSTEM_PROMPT = `You are a compassionate healthcare assistant specializing in mental health and general wellness. Provide supportive responses, general health information, and encourage professional help for serious concerns. Never diagnose or prescribe treatments.`;

const conversationHistories = new Map();

exports.chatWithAI = async (req, res) => {
  console.log('=== Chat Request Started ===');
  console.log('Request body:', req.body);
  console.log('User object:', req.user);
  
  try {
    const { message, conversationId } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error('Authentication failed - no user');
      return res.status(401).json({ 
        error: 'User not authenticated',
        success: false 
      });
    }
    
    const userId = req.user.id;
    console.log('User ID:', userId);

    if (!message) {
      console.error('No message provided');
      return res.status(400).json({ 
        error: 'Message is required',
        success: false 
      });
    }

    console.log('Message received:', message);

    const historyKey = `${userId}_${conversationId || 'default'}`;
    let history = conversationHistories.get(historyKey) || [];
    console.log('Conversation history length:', history.length);

    // Use gemini-2.5-flash - stable version with good performance
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log('Gemini model initialized');

    const conversationContext = history.length > 0 
      ? history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
      : 'This is the start of the conversation.';

    const fullPrompt = `${HEALTHCARE_SYSTEM_PROMPT}\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${message}\n\nAssistant:`;

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiMessage = response.text();
    console.log('Received response from Gemini');

    history.push({ role: 'user', content: message, timestamp: new Date() });
    history.push({ role: 'assistant', content: aiMessage, timestamp: new Date() });

    if (history.length > 20) {
      history = history.slice(-20);
    }

    conversationHistories.set(historyKey, history);

    console.log('=== Chat Request Successful ===');
    res.status(200).json({
      success: true,
      message: aiMessage,
      conversationId: conversationId || 'default',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('=== Chat Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getConversationHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const historyKey = `${userId}_${conversationId}`;
    const history = conversationHistories.get(historyKey) || [];

    res.status(200).json({
      success: true,
      history,
      conversationId: conversationId
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversation history'
    });
  }
};

exports.clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const historyKey = `${userId}_${conversationId}`;
    conversationHistories.delete(historyKey);

    res.status(200).json({
      success: true,
      message: 'Conversation cleared successfully'
    });

  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({
      error: 'Failed to clear conversation'
    });
  }
};