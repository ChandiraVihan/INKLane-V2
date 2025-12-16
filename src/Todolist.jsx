import React, { useState, useEffect } from 'react';
import Header from './Header';
import Home from './Home';
import { Link } from 'react-router-dom';
import './TodoList.css'; // We will create this file next
import api from './api';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newGoal, setNewGoal] = useState('');

  // Function to fetch all todos from our new API endpoint
  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  // useEffect runs this function once when the component first loads
  useEffect(() => {
    fetchTodos();
  }, []);

  // Function to handle adding a new todo
  const handleAddTodo = async (e) => {
    e.preventDefault(); // Prevents the form from reloading the page
    if (!newGoal.trim()) return;

    try {
      await api.post('/todos', { goal: newGoal });
      setNewGoal(''); // Clear the input box
      fetchTodos(); // Refresh the list from the server
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  // Function to toggle the 'isFinished' status
  const handleToggleFinished = async (id, currentStatus) => {
    try {
      await api.put(`/todos/${id}`, { isFinished: !currentStatus });
      fetchTodos(); // Refresh the list
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };
  
  // Function to delete a todo
  const handleDeleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      fetchTodos(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  return (
    <>
     <Header />
      <Link to="/">
        <Home />
      </Link>
    <div className="todo-container">
      <h1>My Goals</h1>
      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add a new goal..."
        />
        <button type="submit">Add</button>
      </form>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo._id} className={todo.isFinished ? 'finished' : ''}>
            <span onClick={() => handleToggleFinished(todo._id, todo.isFinished)}>
              {todo.goal}
            </span>
            <button onClick={() => handleDeleteTodo(todo._id)} className="delete-btn">X</button>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
};

export default TodoList;