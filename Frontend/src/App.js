import React, { useState } from 'react';
import './App.css';

function App() {
  // State variables for form input and user details
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [user, setUser] = useState(null);

  // Handle login logic
  const handleLogin = () => {
    // Simple example: hard-coded user validation
    // In real scenarios, you'd validate against a backend server
    if (username && password) {
      setUser({ username, role });
    } else {
      alert('Please enter username and password');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
    setRole('Student');
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* If user is not logged in, show login form */}
        {!user ? (
          <div>
            <h2>Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
            </select>
            <br />
            <button onClick={handleLogin}>Login</button>
          </div>
        ) : (
          // If user is logged in, show dashboard and logout button
          <div>
            <h2>Welcome, {user.username}</h2>
            <h3>Role: {user.role}</h3>
            <RoleBasedDashboard role={user.role} />
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>
    </div>
  );
}

// Component to show different content based on role
function RoleBasedDashboard({ role }) {
  if (role === 'Instructor') {
    return (
      <div>
        <h3>Instructor Dashboard</h3>
        <p>Here you can create teams and manage student groups.</p>
        {/* Add Instructor-specific functionality here */}
      </div>
    );
  } else {
    return (
      <div>
        <h3>Student Dashboard</h3>
        <p>Here you can view your team assignments and courses.</p>
        {/* Add Student-specific functionality here */}
      </div>
    );
  }
}

export default App;
