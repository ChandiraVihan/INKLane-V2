import React, { useState, useEffect } from 'react';
import Header from './Header';
import Home from './Home';
import { Link } from 'react-router-dom';
import './TodoList.css'; // We will create this file next

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newGoal, setNewGoal] = useState('');

  // Function to fetch all todos from our new API endpoint
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data);
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

    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: newGoal }),
    });

    setNewGoal(''); // Clear the input box
    fetchTodos(); // Refresh the list from the server
  };

  // Function to toggle the 'isFinished' status
  const handleToggleFinished = async (id, currentStatus) => {
    await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFinished: !currentStatus }),
    });
    fetchTodos(); // Refresh the list
  };
  
  // Function to delete a todo
  const handleDeleteTodo = async (id) => {
    await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });
    fetchTodos(); // Refresh the list
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