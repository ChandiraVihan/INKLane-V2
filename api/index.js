// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config(); // This loads the variables from .env

// const app = express();
// const PORT = 3001; // The port your backend will run on

// // --- MIDDLEWARE ---
// // Allow your React app to make requests to this server
// app.use(cors());
// // Allow the server to understand JSON in request bodies
// app.use(express.json());

// // --- DATABASE CONNECTION ---
// // Make sure you have your MONGO_URI in the .env file!
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('Successfully connected to MongoDB Atlas!'))
//   .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// // --- API ROUTES ---

// // A simple test route to make sure the server is working
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'Hello from your new Express server!' });
// });

// // This is where you will migrate your AI logic
// app.post('/api/ask-ai', async (req, res) => {
//   try {
//     const { message } = req.body;
//     console.log("Received message for AI:", message);

//     if (!message) {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     const groqApiKey = process.env.GROQ_API_KEY;
//     if (!groqApiKey) {
//       return res.status(500).json({ error: "GROQ_API_KEY is not set on the server" });
//     }

//     // Your Groq API call logic goes here
//     const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${groqApiKey}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         model: "llama-3.1-70b-instruct",
//         messages: [{ role: "user", content: message }]
//       })
//     });

//     if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Groq API Error:", errorData);
//         return res.status(response.status).json({ error: "An error occurred with the Groq API." });
//     }

//     const data = await response.json();
//     const reply = data.choices[0].message.content;

//     res.json({ reply: reply });

//   } catch (err) {
//     console.error("Function Error:", err);
//     res.status(500).json({ error: "An unknown server error occurred." });
//   }
// });


// app.listen(PORT, () => {
//   console.log(`Express server is running on http://localhost:${PORT}`);
// });


// api/index.js - ES Module Version

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config'; // Use this for ES Modules

const app = express();
const PORT = 3001;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// --- API ROUTES ---
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from your new Express server!' });
});

app.post('/api/ask-ai', async (req, res) => {
  try {
    const { message } = req.body;
    console.log("Received message for AI:", message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is not set on the server" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-instruct",
        messages: [{ role: "user", content: message }]
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error:", errorData);
        return res.status(response.status).json({ error: "An error occurred with the Groq API." });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({ reply: reply });

  } catch (err) {
    console.error("Function Error:", err);
    res.status(500).json({ error: "An unknown server error occurred." });
  }
});

app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});