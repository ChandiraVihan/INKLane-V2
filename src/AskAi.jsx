import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import './AskAi.css';
import { supabase } from "./supabaseClient";

// 1. Keep the Greeting component separate
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

// 2. Use the <Greeting /> component inside AskAi and add the new functionality
const AskAi = () => {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const askAi = async () => {
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("ask-ai", {
      body: { message: question }
    });

    if (error) {
      setReply("Something went wrong.");
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

        <button onClick={askAi} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>

        {reply && <p>{reply}</p>}
      </div>
    </div>
  );
};

export default AskAi;