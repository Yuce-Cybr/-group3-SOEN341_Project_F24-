import React, { useState } from 'react';
import axios from 'axios';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      // Send the sign-up request to the backend
      const response = await axios.post('http://localhost:3000/user', {
        email,
        password
      });

      // If successful, clear the form and display success message
      if (response.status === 201) {
        alert('Sign up successful! You can now log in.');
        setEmail('');
        setPassword('');
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed');
      console.error('Sign up error:', err);
    }
  };

  return (
    <div className="SignUp">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      <div className="input-group">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignUp} className="small-button">Sign Up</button>
      </div>
    </div>
  );
}

export default SignUp;
