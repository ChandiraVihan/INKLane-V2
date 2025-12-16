import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import Todo from './models/Todo.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Learning from './models/Learning.js';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer TOKEN"

  if (token == null) return res.sendStatus(401); // No token, unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token is invalid, forbidden
    req.user = user; // Add the user payload (e.g., { userId: ... }) to the request
    next(); // Proceed to the next step (the actual route logic)
  });
};

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

// POST: Register a new user
app.post('/api/users/register', async (req, res) => {
  console.log('Registration request received:', req.body);
  try {
    const { email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    // Create and save the new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error during registration." });
  }
});


// POST: Log in a user
app.post('/api/users/login', async (req, res) => {
  console.log('Login request received:', req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }
    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }
    // If passwords match, create a JWT
    const token = jwt.sign(
      { userId: user._id }, // The data to store in the token
      process.env.JWT_SECRET, // A secret key from your .env file
      { expiresIn: '1h' } // Token will expire in 1 hour
    );
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "Server error during login." });
  }
});

// POST: Verify a JWT token
app.post('/api/users/verify-token', authenticateToken, (req, res) => {
  // If middleware passes, token is valid
  if (!req.user) {
    return res.status(500).json({ error: 'Authentication middleware failed to attach user data' });
  }
  
  if (!req.user.userId) {
    return res.status(500).json({ error: 'User ID not found in token payload', payload: req.user });
  }
  
  res.json({ valid: true, userId: req.user.userId });
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

// app.get('/api/todos', async (req, res) => {
//   try {
//     const todos = await Todo.find({});
//     res.json(todos);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch todos." });
//   }
// });

// // POST: Create a new to-do item
// app.post('/api/todos', async (req, res) => {
//   try {
//     const { goal } = req.body;
//     const newTodo = new Todo({ goal });
//     await newTodo.save();
//     res.status(201).json(newTodo);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create todo." });
//   }
// });

// // PUT: Update a to-do item (e.g., mark as finished)
// app.put('/api/todos/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isFinished } = req.body;
//     const updatedTodo = await Todo.findByIdAndUpdate(id, { isFinished }, { new: true });
//     res.json(updatedTodo);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update todo." });
//   }
// });

// // DELETE: Remove a to-do item
// app.delete('/api/todos/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Todo.findByIdAndDelete(id);
//     res.json({ message: "Todo deleted successfully." });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to delete todo." });
//   }
// });

// In api/index.js
// REMOVE YOUR OLD TODO ROUTES AND REPLACE WITH THESE

// GET: Fetch all learnings for the logged-in user
app.get('/api/learnings', authenticateToken, async (req, res) => {
  try {
    // Sort by date, newest first
    const learnings = await Learning.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json(learnings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch learnings." });
  }
});

// POST: Create a new learning entry
app.post('/api/learnings', authenticateToken, async (req, res) => {
  try {
    const { text, imageUrl, date } = req.body;
    const newLearning = new Learning({
      text,
      imageUrl,
      date,
      userId: req.user.userId,
    });
    await newLearning.save();
    res.status(201).json(newLearning);
  } catch (err) {
    res.status(500).json({ error: "Failed to create learning." });
  }
});

// GET all todos for the logged-in user
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todos." });
  }
});

// POST a new todo for the logged-in user
app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const { goal } = req.body;
    const newTodo = new Todo({ goal, userId: req.user.userId });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: "Failed to create todo." });
  }
});

// PUT (update) a todo, ensuring it belongs to the logged-in user
app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFinished } = req.body;
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user.userId }, // Condition: must match ID and user
      { isFinished },
      { new: true }
    );
    if (!updatedTodo) return res.status(404).json({ error: "Todo not found or not authorized." });
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: "Failed to update todo." });
  }
});

// DELETE a todo, ensuring it belongs to the logged-in user
app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!deletedTodo) return res.status(404).json({ error: "Todo not found or not authorized." });
        res.json({ message: "Todo deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete todo." });
    }
});

// 5. Start the Server (
// This command tells the server to run continuously and listen for requests.
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});