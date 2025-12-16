import React, { useState, useEffect } from 'react';
import Header from './Header';
import Home from './Home';
import { Link } from 'react-router-dom';
import './TodoList.css'; // We will create this file next
import api from './api';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [priority, setPriority] = useState(1); // 1 = low, 2 = medium, 3 = high

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
      await api.post('/todos', { goal: newGoal, priority: parseInt(priority) });
      setNewGoal(''); // Clear the input box
      setPriority(1); // Reset priority to low
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

  // Function to toggle pin status
  const handleTogglePin = async (id, currentPinned) => {
    try {
      await api.put(`/todos/${id}`, { pinned: !currentPinned });
      fetchTodos(); // Refresh the list
    } catch (error) {
      console.error("Failed to pin/unpin todo:", error);
    }
  };

  // Function to render priority stars
  const renderPriorityStars = (priority) => {
    const stars = [];
    for (let i = 1; i <= 3; i++) {
      stars.push(
        <span key={i} className="star">
          {i <= priority ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  // Separate pinned and unpinned todos
  const pinnedTodos = todos.filter(todo => todo.pinned);
  const unpinnedTodos = todos.filter(todo => !todo.pinned);

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
        <select 
          className="priority-selector"
          value={priority}
          onChange={(e) => setPriority(parseInt(e.target.value))}
        >
          <option value={1}>Low Priority</option>
          <option value={2}>Medium Priority</option>
          <option value={3}>High Priority</option>
        </select>
        <button type="submit">Add</button>
      </form>

      {/* Pinned Todos Section */}
      {pinnedTodos.length > 0 && (
        <div className="pinned-todos">
          <h2>Pinned Goals</h2>
          <ul className="todo-list">
            {pinnedTodos.map((todo) => (
              <li 
                key={todo._id} 
                className={`${todo.isFinished ? 'finished' : ''} ${todo.priority === 3 ? 'high-priority' : todo.priority === 2 ? 'medium-priority' : 'low-priority'}`}
              >
                <div className="todo-content">
                  <div className="priority-stars">
                    {renderPriorityStars(todo.priority)}
                  </div>
                  <span 
                    className="todo-text"
                    onClick={() => handleToggleFinished(todo._id, todo.isFinished)}
                  >
                    {todo.goal}
                  </span>
                </div>
                <div className="todo-actions">
                  <button 
                    className={`pin-btn ${todo.pinned ? 'pinned' : ''}`}
                    onClick={() => handleTogglePin(todo._id, todo.pinned)}
                  >
                    📌
                  </button>
                  <button 
                    onClick={() => handleDeleteTodo(todo._id)} 
                    className="delete-btn"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Regular Todos Section */}
      <h2>{pinnedTodos.length > 0 ? 'Other Goals' : 'All Goals'}</h2>
      <ul className="todo-list">
        {unpinnedTodos.length === 0 ? (
          <li className="empty-state">No goals yet. Add your first goal above!</li>
        ) : (
          unpinnedTodos.map((todo) => (
            <li 
              key={todo._id} 
              className={`${todo.isFinished ? 'finished' : ''} ${todo.priority === 3 ? 'high-priority' : todo.priority === 2 ? 'medium-priority' : 'low-priority'}`}
            >
              <div className="todo-content">
                <div className="priority-stars">
                  {renderPriorityStars(todo.priority)}
                </div>
                <span 
                  className="todo-text"
                  onClick={() => handleToggleFinished(todo._id, todo.isFinished)}
                >
                  {todo.goal}
                </span>
              </div>
              <div className="todo-actions">
                <button 
                  className={`pin-btn ${todo.pinned ? 'pinned' : ''}`}
                  onClick={() => handleTogglePin(todo._id, todo.pinned)}
                >
                  📌
                </button>
                <button 
                  onClick={() => handleDeleteTodo(todo._id)} 
                  className="delete-btn"
                >
                  ✕
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
    </>
  );
};

export default TodoList;