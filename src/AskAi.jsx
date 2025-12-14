import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import './AskAi.css';
import { supabase } from "./supabaseClient";

// The Greeting component remains unchanged
const Greeting = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) setGreeting('Good Morning, What can I do for you today?');
      else if (currentHour >= 12 && currentHour < 18) setGreeting('Good Afternoon, What can I do for you today?');
      else if (currentHour >= 18 && currentHour < 22) setGreeting('Good Evening, What can I do for you today?');
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

  const askAi = async () => {
    if (!question.trim()) return;
    setLoading(true);

    // 1. Read the secret key from Vite's environment variables
    const functionSecret = import.meta.env.VITE_FUNCTION_SECRET;

    // --- START: DEBUGGING LOG ---
    // This will print the key to your browser's developer console (F12)
    console.log(`[CLIENT] Sending secret key: "${functionSecret}"`);
    // --- END: DEBUGGING LOG ---

    if (!functionSecret) {
      console.error("Error: VITE_FUNCTION_SECRET is not set in the .env file.");
      setReply("Configuration error: The application is missing its secret key.");
      setLoading(false);
      return;
    }

    // 2. Invoke the function with the secret key
    const { data, error } = await supabase.functions.invoke("ask-ai", {
      body: { message: question },
      headers: {
        'Authorization': `Bearer ${functionSecret}`
      }
    });

    if (error) {
      console.error("Function invoke error:", error);
      if (error.context?.status === 401) {
        setReply("Authorization failed. Please check the secret key configuration.");
      } else {
        setReply("Something went wrong. Please try again.");
      }
    } else {
      setReply(data.reply);
    }

    setLoading(false);
  };

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