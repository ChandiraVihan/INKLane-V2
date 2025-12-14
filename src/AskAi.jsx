import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import './AskAi.css';

// --- CHANGE 1: REMOVE THE SUPABASE IMPORT ---
// import { supabase } from "./supabaseClient"; // This line is no longer needed.

// The Greeting component is perfect and does not need any changes.
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
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // --- CHANGE 2: REPLACE THE ENTIRE askAi FUNCTION ---
  // This new version uses the standard `fetch` API to talk to your Express backend.
  const askAi = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setReply(""); // Clear the previous reply

    try {
      // The Vite proxy we configured handles routing this to http://localhost:3001
      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the server sends an error (like a 400 or 500 status), use its error message.
        throw new Error(data.error || "Something went wrong on the server.");
      }

      setReply(data.reply);

    } catch (error) {
      console.error("Failed to ask AI:", error);
      // Display the error message in the UI for a better user experience.
      setReply(`Error: ${error.message}`);
    }

    setLoading(false);
  };
  // --- END OF REPLACED FUNCTION ---


  // The JSX for your component does not need to be changed at all.
  return (
    <div>
      <Header />
      <Link to="/">
        <Home />
      </Link>
      <div className="ai-container">
        <Greeting />
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something..."
        />
        <button onClick={askAi} disabled={loading || !question}>
          {loading ? "Thinking..." : "Ask"}
        </button>
        {reply && <p>{reply}</p>}
      </div>
    </div>
  );
};

export default AskAi;