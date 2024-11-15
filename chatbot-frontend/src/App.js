import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; 
import "./App.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello, I'm the customer service bot. See the buttons for some of the things I'm capable of, or type below and I'll try to help you." },
  ]);
  const [input, setInput] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showButtons, setShowButtons] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [hovering, setHovering] = useState(false);

  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const newMessage = { role: "user", content: text };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setShowButtons(false);
    setIsTyping(true);

    try {
      const response = await axios.post("http://localhost:5000/api/message", { message: text });
      const botMessage = { role: "bot", content: response.data.response };

      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", content: "We're having a hard time connecting with our system to handle your request." },
      ]);
      setIsTyping(false);
    }
  };

  const handleButtonClick = (text) => {
    sendMessage(text);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const confirmClearHistory = () => {
    setShowClearConfirmation(true);
  };

  const clearHistory = () => {
    setMessages([
      { role: "bot", content: "Hello, I'm the customer service bot. See the buttons for some of the things I'm capable of, or type below and I'll try to help you." },
    ]);
    setShowButtons(true);
    setShowClearConfirmation(false);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  if (!isOpen) {
    return (
      <div className="chatbot-widget" onClick={toggleChatbot}>
        <span>💬</span> Chat
      </div>
    );
  }

  return (
    <div className={`chatbot ${isFullScreen ? "fullscreen" : ""}`}>
      <div className="chatbot-header">
        <span>Customer Service Bot</span>
        <div className="chatbot-controls">
          <button onClick={toggleFullScreen}>⤢</button>
          <button
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={confirmClearHistory}
          >
            🗑️
            {hovering && (
              <div className="clear-history-hover">
                Clear Chat
              </div>
            )}
          </button>
          <button onClick={toggleChatbot}>✕</button>
        </div>
      </div>

      {showClearConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <p>Are you sure you want to clear your chat history?</p>
            <button onClick={clearHistory}>Clear History</button>
            <button onClick={() => setShowClearConfirmation(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div ref={chatWindowRef} className={`chat-window ${showClearConfirmation ? "blur" : ""}`}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.role === "bot" && <div className="bot-icon">🤖</div>}
            <div className="message-bubble">
              {msg.role === "bot" ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown> // Render bot messages as Markdown
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {showButtons && (
          <div className="button-container centered-buttons">
            <button onClick={() => handleButtonClick("Check Order Status")}>Check Order Status</button>
            <button onClick={() => handleButtonClick("Return an Order")}>Return an Order</button>
            <button onClick={() => handleButtonClick("Cancel an Order")}>Cancel an Order</button>
            <button onClick={() => handleButtonClick("Search for a Part")}>Search for a Part</button>
            <button onClick={() => handleButtonClick("Find Model Number")}>Find Model Number</button>
            <button onClick={() => handleButtonClick("Installation Help")}>Installation Help</button>
            <button onClick={() => handleButtonClick("Compatibility Check")}>Compatibility Check</button>
            <button onClick={() => handleButtonClick("Repair Help")}>Repair Help</button>
          </div>
        )}

        {isTyping && (
          <div className="message bot">
            <div className="bot-icon">🤖</div>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your response"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
// hi
//hi

export default Chatbot;
