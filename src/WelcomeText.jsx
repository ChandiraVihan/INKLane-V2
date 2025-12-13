import React from 'react';
import DecryptedText from './DecryptedText';
import './App.css';

const WelcomeText = ({ text }) => {
  return (
    <div className="welcome-text">
      <DecryptedText
        text={text}
        encryptedClassName="encrypted-text"
        animateOn="view"
        revealDirection="center"
        speed={69}
      />
    </div>
  );
};

export default WelcomeText;