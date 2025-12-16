import React, { useState } from "react";
import LoginPage, {
  Reset,
  Logo,
  Email,
  Banner,
  ButtonAfter,
  Password,
  Title,
  Welcome,
  Submit
} from "@react-login-page/page3";
import LoginLogo from "react-login-page/logo-rect";
import BannerImage from'./assets/signup.jpg'
import { Link, useNavigate } from 'react-router-dom';
import api from './api';

const register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register form submitted with:', { email, password });
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      const response = await api.post('/users/register', { email, password });
      console.log('Register response:', response.data);
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'An error occurred during registration');
    }
  };

  
  const handleButtonClick = (e) => {
    console.log('Register button clicked');
    handleSubmit(e);
  };

  return (
    <LoginPage style={{ height: 580 }} onSubmit={handleSubmit}>
      <Title>Create an Account</Title>
      <Welcome>Hey! Please create an account to use INKLane.</Welcome>
      <Logo visible={false} />
      <Email 
        index={2} 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Password 
        index={3} 
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Banner style={{ backgroundImage: `url(${BannerImage})` }} />
      <Submit onClick={handleButtonClick}>Register</Submit>
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>Registration successful! Redirecting to login...</div>}
      <ButtonAfter>
        Already have an account ? <Link to="/login">click to log in</Link>
      </ButtonAfter>
    </LoginPage>
  );
};

export default register;