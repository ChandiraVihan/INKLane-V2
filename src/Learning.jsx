import React from 'react';
import Header from './Header';
import Home from './Home';
import { Link } from 'react-router-dom';

const Learning = () => {
  return (
    <div>
      <Header />
      <Link to="/">
        <Home />
      </Link>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Learning Page</h1>
        <p>This page is under construction.</p>
      </div>
    </div>
  );
};

export default Learning;