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
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;