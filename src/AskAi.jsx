import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import './AskAi.css';
import ReactMarkdown from 'react-markdown';

const Greeting = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) setGreeting('Good Morning, What can I do for you today?');
      else if (currentHour >= 12 && currentHour < 18) setGreeting('Good Afternoon, What can I do for you today?');
      else setGreeting('Good Evening, What can I do for you today?');
    };

    updateGreeting();
    const intervalId = setInterval(updateGreeting, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return <h1>{greeting}</h1>;
};



const AskAi = () => {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAi = async () => {
    if (!question.trim()) return;
    setLoading(true);

    const userMessage = { role: 'user', content: question };
    const newHistory = [...conversation, userMessage];

    setConversation(newHistory);
    setQuestion("");

    try {
      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      
      const assistantMessage = { role: 'assistant', content: data.reply };
      setConversation([...newHistory, assistantMessage]);

    } catch (error) {
      console.error("Failed to ask AI:", error);
      const errorMessage = { role: 'assistant', content: `Error: ${error.message}` };
      setConversation([...newHistory, errorMessage]);
    }

    setLoading(false);
  };

  return (
    <div>
      <Header />
      <Link to="/"><Home /></Link>

      <div className="ai-container">
        <Greeting /> {/* This line will now work correctly */}

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
          onKeyPress={(e) => e.key === 'Enter' && askAi()}
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