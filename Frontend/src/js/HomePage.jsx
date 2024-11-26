import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../controllers/AuthContext';

function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');  // Role dropdown (default Student)
  const { login } = useAuth();
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password, role);  // Pass the role during login
    } catch (err) {
      setAuthError('Login failed. Please check your credentials.');
    }
  };

  const goToSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="login-page">
      <h1 className="website-title">RateMyPeer</h1>  {/* Title added at the top */}
      <div className="login-card">
        <h2>Sign In</h2>
        {authError && <p className="error">{authError}</p>}
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          
          {/* Role Dropdown */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="role-dropdown"
          >
            <option value="Student">Student</option>
            <option value="Instructor">Instructor</option>
          </select>

          <button onClick={handleLogin} className="primary-button">Sign In</button>
          <button onClick={goToSignUp} className="secondary-button">Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
