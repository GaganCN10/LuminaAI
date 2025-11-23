import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../assets/componentsCss/Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId] = useState('default');

  // 🔊 Text-to-Speech toggle
  const [ttsAllowed, setTtsAllowed] = useState(false);

  const messagesEndRef = useRef(null);

  let recognition = null;

  // 🎤 Initialize Speech Recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history
  useEffect(() => {
    loadConversationHistory();
  }, [conversationId]);

  const loadConversationHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/chat/history/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages(response.data.history);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // 🎤 Voice-to-text
  const startRecording = () => {
    if (!recognition) {
      alert('Your browser does not support Speech Recognition.');
      return;
    }

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputMessage(transcript);
    };

    recognition.onerror = (e) => {
      console.log('Voice error:', e);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log('Voice ended');
      setIsRecording(false);
    };
  };

  const stopRecording = () => {
    if (recognition) recognition.stop();
    setIsRecording(false);
  };

  // 🔊 Text-to-Speech
  const speakText = (text) => {
    if (!ttsAllowed) return;

    if (!window.speechSynthesis) {
      console.log('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak assistant replies
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && ttsAllowed) {
      speakText(lastMessage.content);
    }
  }, [messages, ttsAllowed]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/chat',
        {
          message: userMessage.content,
          conversationId: conversationId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(response.data.timestamp)
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    if (!window.confirm('Are you sure you want to clear this conversation?'))
      return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/chat/clear/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([]);
      speakText('Conversation cleared.');
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h2>Healthcare Assistant</h2>
          <p className="subtitle">Mental Health & Wellness Support</p>
        </div>

        <button onClick={clearConversation} className="clear-btn">
          Clear Chat
        </button>

        {/* 🔊 Voice Toggle Button */}
        <button
          onClick={() => setTtsAllowed(!ttsAllowed)}
          className="tts-toggle-btn"
        >
          {ttsAllowed ? '🔇 Disable Voice' : '🔊 Enable Voice'}
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Welcome to Healthcare Chat</h3>
            <p>I’m here to provide support and information.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {msg.role === 'user' ? 'You' : 'Healthcare Assistant'}
                  </span>
                  <span className="message-time">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div className="message-text">{msg.content}</div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 🎤 Voice + Input + Send */}
      <form onSubmit={sendMessage} className="input-container">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`mic-btn ${isRecording ? 'recording' : ''}`}
        >
          {isRecording ? '🎙 Stop' : '🎤 Voice'}
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message or use voice..."
          disabled={isLoading}
          className="message-input"
        />

        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="send-btn"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <div className="disclaimer">
        <small>⚠️ This is not a substitute for professional medical advice.</small>
      </div>
    </div>
  );
};

export default Chat;