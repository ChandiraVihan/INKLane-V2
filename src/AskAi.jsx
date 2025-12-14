import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';

const AskAi = () => {
  // --- STATE CHANGES ---
  const [question, setQuestion] = useState("");
  // We no longer need `reply`. Instead, we store the whole conversation.
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- LOGIC CHANGES ---
  const askAi = async () => {
    if (!question.trim()) return;
    setLoading(true);

    const userMessage = { role: 'user', content: question };
    // Create the new history to be sent to the API
    const newHistory = [...conversation, userMessage];

    // Immediately add the user's question to the chat display
    setConversation(newHistory);
    setQuestion(""); // Clear the input box

    try {
      // The fetch call now sends the 'history' object
      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong on the server.");
      }

      const assistantMessage = { role: 'assistant', content: data.reply };
      // Add the AI's response to the conversation
      setConversation([...newHistory, assistantMessage]);

    } catch (error) {
      console.error("Failed to ask AI:", error);
      const errorMessage = { role: 'assistant', content: `Error: ${error.message}` };
      // Add the error message to the conversation
      setConversation([...newHistory, errorMessage]);
    }

    setLoading(false);
  };

  // --- JSX / RENDER CHANGES ---
  return (
    <div>
      <Header />
      <Link to="/">
        <Home />
      </Link>
      <div className="ai-container">
        <Greeting />

        {/* This is the new chat history display area */}
        <div className="chat-history">
          {conversation.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))}
        </div>

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && askAi()} // Allows pressing Enter to send
          placeholder="Ask something..."
        />
        <button onClick={askAi} disabled={loading || !question}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>
    </div>
  );
};

export default AskAi;