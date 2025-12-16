import React, { useState } from "react";
import LoginPage, {
  Title,
  Welcome,
  Email,
  Password,
  Banner,
  ButtonAfter,
  Logo,
  Submit
} from "@react-login-page/page3";
import BannerImage from './assets/signin.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted with:', { email, password });
    try {
      const response = await api.post('/users/login', { email, password });
      console.log('Login response:', response.data);
      const { token, userId } = response.data;
      login(token, userId);
      navigate('/app'); // Redirect to main app after successful login
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'An error occurred during login');
    }
  };

  const handleButtonClick = (e) => {
    handleSubmit(e);
  };

  return (
    <LoginPage
      style={{ height: 580 }}
      onSubmit={handleSubmit}
    >
      <Title>Log in to Your Account</Title>
      <Welcome>Hey! Please enter your details to sign in.</Welcome>
      <Logo visible={false} />
      <Email 
        index={2} 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Password 
        index={3} 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Submit onClick={handleButtonClick}>Log In</Submit>
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
      <Banner style={{ backgroundImage: `url(${BannerImage})` }} />
      <ButtonAfter>
        Don't have an account ? <Link to="/register">Sign up</Link>
      </ButtonAfter>
    </LoginPage>
  );
};

export default Login;