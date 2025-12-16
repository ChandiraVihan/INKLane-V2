import React, { useState, useEffect } from 'react';
import api from './api';
import Header from './Header';
import Home from './Home';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Styles for the calendar
import './Learning.css';

 const Learning = () => {
  const [learnings, setLearnings] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(null); // For filtering learnings by date

  // ---  CLOUDINARY DETAILS  ---
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const fetchLearnings = async () => {
    try {
      const response = await api.get('/learnings');
      setLearnings(response.data);
    } catch (error) {
      console.error("Failed to fetch learnings:", error);
    }
  };

  useEffect(() => {
    fetchLearnings();
  }, []);

  // Function to adjust textarea height based on content
  const adjustTextareaHeight = (element) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${Math.min(element.scrollHeight, 300)}px`; // Max height of 300px
    }
  };

  // Adjust textarea height when text changes
  useEffect(() => {
    const textarea = document.querySelector('.learning-form textarea');
    adjustTextareaHeight(textarea);
  }, [text]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    let imageUrl = '';

    // STEP 1: If an image is selected, upload it to Cloudinary first.
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      try {
        const response = await api.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
        imageUrl = response.data.secure_url; // Get the URL from Cloudinary
      } catch (error) {
        console.error("Image upload failed:", error);
        setLoading(false);
        return; // Stop if the upload fails
      }
    }

    // STEP 2: Now, save the learning to  backend with the Cloudinary URL.
    try {
      await api.post('/learnings', { text, imageUrl, date });
      // Reset form and refresh list
      setText('');
      setImage(null);
      setDate(new Date());
      fetchLearnings();
    } catch (error) {
      console.error("Failed to save learning:", error);
    }
    setLoading(false);
  };
  
  // Filter learnings by selected date
  const filteredLearnings = filterDate
    ? learnings.filter(learning => {
        const learningDate = new Date(learning.date);
        return learningDate.toDateString() === filterDate.toDateString();
      })
    : learnings;
  
  return (
    <div>
      <Header />
      <Link to="/"><Home /></Link>
<div className="learning-container">
  <h1>My Learnings</h1>
  
  {/* Date filter */}
  <div className="date-filter">
    <label>Filter by date: </label>
    <DatePicker 
      selected={filterDate} 
      onChange={(date) => setFilterDate(date)} 
      placeholderText="Select a date to filter..."
    />
    {filterDate && (
      <button onClick={() => setFilterDate(null)}>Clear Filter</button>
    )}
  </div>

  <form onSubmit={handleSubmit} className="learning-form">
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="What did you learn today?"
      onInput={(e) => adjustTextareaHeight(e.target)}
    />
    <div className="form-row">
      <DatePicker selected={date} onChange={(d) => setDate(d)} />
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
    </div>
    <button type="submit" disabled={loading}>
      {loading ? 'Saving...' : 'Add Learning'}
    </button>
  </form>

  <div className="learnings-list">
    {filteredLearnings.map((learning) => (
      <div key={learning._id} className="learning-item">
        {learning.imageUrl && <img src={learning.imageUrl} alt="Learning visual" />}
        <div className="learning-content">
          <p>{learning.text}</p>
          <small>{new Date(learning.date).toLocaleDateString()}</small>
        </div>
      </div>
    ))}
  </div>
</div>
    </div>
  );
 };

export default Learning;