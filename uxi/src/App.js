import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  // Handle login logic
  const handleLogin = async () => {
    if (username && password) {
      try {
        const response = await axios.post('https://soen341-api.onrender.com/login', {
          username,
          password,
          role
        });
        if (response.status === 200) {
          setUser(response.data);
        } else {
          throw new Error('Failed to log in');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
        console.error('Login error:', err);
      }
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
        {!user ? (
          <div>
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
            </select>
            <button onClick={handleLogin}>Login</button>
          </div>
        ) : (
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

function RoleBasedDashboard({ role }) {
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    Papa.parse(file, {
      complete: function(results) {
        console.log("Parsed results:", results);
        setStudents(results.data);
      },
      header: true
    });
  };

  const handleSaveTeams = () => {
    axios.post('https://soen341-api.onrender.com/teams', { students })
      .then(response => alert('Teams saved successfully!'))
      .catch(error => alert('Failed to save teams: ' + error.message));
  };

  if (role === 'Instructor') {
    return (
      <div>
        <h3>Instructor Dashboard</h3>
        <p>Here you can create teams and manage student groups.</p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload CSV</button>
        <button onClick={handleSaveTeams}>Save Teams</button>
        {/* Display and manage student team assignments */}
      </div>
    );
  } else {
    return (
      <div>
        <h3>Student Dashboard</h3>
        <p>Here you can view your team assignments and courses.</p>
      </div>
    );
  }
}

export default App;