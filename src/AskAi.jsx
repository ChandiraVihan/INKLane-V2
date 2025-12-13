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
    // Stop if the question is empty
    if (!question.trim()) return;

    setLoading(true);

    // --- START: MODIFICATION ---
    // 1. Retrieve the secret key from your React app's environment variables.
    const functionSecret = process.env.REACT_APP_FUNCTION_SECRET;

    // 2. Add a check to ensure the secret key is available.
    if (!functionSecret) {
      console.error("Error: REACT_APP_FUNCTION_SECRET is not set in the environment.");
      setReply("Configuration error: The application is missing its secret key.");
      setLoading(false);
      return;
    }
    // --- END: MODIFICATION ---

    // 3. Invoke the function with the secret key in the Authorization header.
    const { data, error } = await supabase.functions.invoke("ask-ai", {
      body: { message: question },
      headers: {
        'Authorization': `Bearer ${functionSecret}` // Use the secret key
      }
    });

    if (error) {
      console.error("Function invoke error:", error);
      // Provide a more specific error if unauthorized
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