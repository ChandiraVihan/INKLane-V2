// In api/models/Todo.js

import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  goal: {
    type: String,
    required: true,
  },
  isFinished: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number,
    default: 1, // 1 = low, 2 = medium, 3 = high
    enum: [1, 2, 3]
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  // This field connects each to-do item to a specific user.
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This creates a link to the 'User' model.
    required: true,
  }
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;