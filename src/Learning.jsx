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
  const [filterDate, setFilterDate] = useState(null); // New state for filtering
  const [loading, setLoading] = useState(false);

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

  // Filter learnings based on selected date
  const filteredLearnings = filterDate 
    ? learnings.filter(learning => {
        const learningDate = new Date(learning.date);
        return learningDate.toDateString() === filterDate.toDateString();
      })
    : learnings;

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
        // Make direct fetch call to Cloudinary API instead of using our api instance
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );
        
        if (!response.ok) {
          throw new Error(`Cloudinary upload failed with status ${response.status}`);
        }
        
        const data = await response.json();
        imageUrl = data.secure_url; // Get the URL from Cloudinary
        console.log("Image uploaded successfully:", imageUrl); // Debugging line
      } catch (error) {
        console.error("Image upload failed:", error);
        setLoading(false);
        return; // Stop if the upload fails
      }
    }

    // STEP 2: Now, save the learning to backend with the Cloudinary URL.
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

  // Function to clear the date filter
  const clearFilter = () => {
    setFilterDate(null);
  };

  return (
    <div>
      <Header />
      <Link to="/"><Home /></Link>
      <div className="learning-container">
        <h1>My Learnings</h1>
        <form onSubmit={handleSubmit} className="learning-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you learn today?"
            rows="4"
          />
          <div className="form-row">
            <DatePicker 
              selected={date} 
              onChange={(d) => setDate(d)} 
              placeholderText="Select date"
            />
            <input 
              type="file" 
              onChange={(e) => setImage(e.target.files[0])} 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Learning'}
          </button>
        </form>

        {/* Date filter section */}
        <div className="filter-section">
          <h2>Filter by Date</h2>
          <div className="filter-controls">
            <DatePicker 
              selected={filterDate} 
              onChange={(d) => setFilterDate(d)} 
              placeholderText="Select date to filter"
            />
            <button onClick={clearFilter} className="clear-filter-btn">
              Clear Filter
            </button>
          </div>
        </div>

        <div className="learnings-list">
          {filteredLearnings.length === 0 ? (
            <p className="no-learnings">
              {filterDate ? 'No learnings found for this date.' : 'No learnings yet. Add your first learning above!'}
            </p>
          ) : (
            filteredLearnings.map((learning) => (
              <div key={learning._id} className="learning-item">
                {learning.imageUrl && <img src={learning.imageUrl} alt="Learning visual" />}
                <div className="learning-content">
                  <p>{learning.text}</p>
                  <small>{new Date(learning.date).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
 };

export default Learning;