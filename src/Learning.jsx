import React, { useState, useEffect } from 'react';
import api from './api';
import Header from './Header';
import Home from './Home';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Styles for the calendar
import './Learning.css';
import ReactMarkdown from 'react-markdown';

 const Learning = () => {
  const [learnings, setLearnings] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(null);
  const [selectedLearning, setSelectedLearning] = useState(null); // For modal popup
  const [aiResponse, setAiResponse] = useState(''); // For AI response
  const [aiLoading, setAiLoading] = useState(false); // For AI loading state

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
    
  // Function to open learning in modal
  const openLearningModal = (learning) => {
    setSelectedLearning(learning);
    setAiResponse(''); // Clear previous AI response when opening new learning
  };
  
  // Function to close modal
  const closeLearningModal = () => {
    setSelectedLearning(null);
    setAiResponse('');
  };
  
  // Function to send learning content to AI
  const sendToAI = async () => {
    if (!selectedLearning) return;
    
    setAiLoading(true);
    setAiResponse('');
    
    try {
      // Prepare the prompt for the AI
      const prompt = `Based on the following learning content, please provide a detailed explanation or deeper insights:\n\n"${selectedLearning.text}"${
        selectedLearning.imageUrl ? '\n\nThere is also an image associated with this learning.' : ''
      }`;
      
      const response = await api.post('/ask-ai', {
        history: [
          { role: 'user', content: prompt }
        ]
      });
      
      setAiResponse(response.data.reply);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setAiResponse('Sorry, I couldn\'t process that request. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };
  
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
      <div 
        key={learning._id} 
        className="learning-item"
        onClick={() => openLearningModal(learning)} // Open modal on click
      >
        {learning.imageUrl && <img src={learning.imageUrl} alt="Learning visual" />}
        <div className="learning-content">
          <p>{learning.text}</p>
          <small>{new Date(learning.date).toLocaleDateString()}</small>
        </div>
      </div>
    ))}
  </div>
</div>

{/* Modal for detailed view */}
{selectedLearning && (
  <div className="modal-overlay" onClick={closeLearningModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={closeLearningModal}>×</button>
      <div className="modal-learning-item">
        {selectedLearning.imageUrl && (
          <img 
            src={selectedLearning.imageUrl} 
            alt="Learning visual" 
            className="modal-learning-image"
          />
        )}
        <div className="modal-learning-content">
          <p className="modal-learning-text">{selectedLearning.text}</p>
          <small className="modal-learning-date">
            {new Date(selectedLearning.date).toLocaleDateString()}
          </small>
          
          {/* AI Section */}
          <div className="ai-section">
            <button 
              className="ai-button"
              onClick={sendToAI}
              disabled={aiLoading}
            >
              {aiLoading ? 'Learning Deep...' : 'Learn Deep'}
            </button>
            
            {aiResponse && (
              <div className="ai-response">
                <h3>Deep Insights:</h3>
                <div className="ai-response-content">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
 };

export default Learning;