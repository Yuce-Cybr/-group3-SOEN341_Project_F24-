import React, { useState } from 'react';
import './App.css';  // Ensure the CSS file is imported correctly
import { useNavigate } from 'react-router-dom';
import supabase from './supabase';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setError('');
    setSuccessMessage('');

    if (!email || password.length < 8) {
      setError('Please enter a valid email and password (min 8 characters).');
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        throw error;
      }

      setSuccessMessage('Sign-up successful! Redirecting to login...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please try again.');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2>Create an Account</h2>
        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="signup-input"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signup-input"
          />
          <button onClick={handleSignUp} className="primary-button">Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
