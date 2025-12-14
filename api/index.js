// api/index.js - THE COMPLETE AND CORRECT FILE

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import Todo from './models/Todo.js';

// 1. Initialize the Express App
const app = express();
const PORT = 3001;

// 2. Essential Middleware
app.use(cors());
app.use(express.json());

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => {
      console.error('CRITICAL: Error connecting to MongoDB Atlas:', err);
      process.exit(1); 
  });

// 4. API Routes
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: "Conversation history is required." });
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
        model: "llama-3.3-70b-versatile",
        messages: history
      })
    });
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error:", errorData);
        const errorMessage = errorData?.error?.message || "An error occurred with the Groq API.";
        return res.status(response.status).json({ error: errorMessage });
    }
    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.json({ reply: reply });
  } catch (err) {
    console.error("Function Error:", err);
    res.status(500).json({ error: "An unknown server error occurred." });
  }
});

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todos." });
  }
});

// POST: Create a new to-do item
app.post('/api/todos', async (req, res) => {
  try {
    const { goal } = req.body;
    const newTodo = new Todo({ goal });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: "Failed to create todo." });
  }
});

// PUT: Update a to-do item (e.g., mark as finished)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isFinished } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(id, { isFinished }, { new: true });
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: "Failed to update todo." });
  }
});

// DELETE: Remove a to-do item
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    res.json({ message: "Todo deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo." });
  }
});

// 5. Start the Server (THIS IS THE CRITICAL MISSING PART)
// This command tells the server to run continuously and listen for requests.
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});