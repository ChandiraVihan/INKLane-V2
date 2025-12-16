import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  // ---  CLOUDINARY DETAILS  ---
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const fetchLearnings = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.get('/api/learnings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLearnings(response.data);
    } catch (error) {
      console.error("Failed to fetch learnings:", error);
    }
  };

  useEffect(() => {
    fetchLearnings();
  }, []);

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
        const response = await axios.post(
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
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/learnings',
        { text, imageUrl, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
   return (
     <div>
       <Header />
       <Link to="/">
         <Home />
       </Link>       
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
          <DatePicker selected={date} onChange={(d) => setDate(d)} />
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Learning'}
        </button>
      </form>

      <div className="learnings-list">
        {learnings.map((learning) => (
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

