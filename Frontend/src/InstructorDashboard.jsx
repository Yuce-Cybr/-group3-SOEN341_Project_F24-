import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';
import supabase from './supabase';
import SidebarComponent from './SidebarComponent';
import '../src/InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user, role, logout } = useAuth();
  const [fetchError, setFetchError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('users').select();
      if (error) {
        setFetchError('Could not fetch users');
        console.log(error);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.team_id?.toString().includes(searchQuery)
  );

  if (!user || role !== 'Instructor') {
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard-container">
      <SidebarComponent />
      <div className="instructor-dashboard">
        <header className="dashboard-header">
          <h2>Instructor Dashboard</h2>
          <button onClick={logout} className="logout-btn">Logout</button>
        </header>

        {/* Profile Section */}
        <section className="profile-card">
          <h3>Instructor Profile</h3>
          <p><strong>Name:</strong> {user.name || "Instructor"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {role}</p>
        </section>

        {/* Search Bar */}
        <section className="search-bar">
          <input
            type="text"
            placeholder="Search by email or team ID"
            value={searchQuery}
            onChange={handleSearch}
          />
        </section>

        {/* Users Table */}
        <section className="users-table">
          {loading ? (
            <p>Loading users...</p>
          ) : fetchError ? (
            <p>{fetchError}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Team ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} onClick={() => setSelectedUser(user)}>
                    <td>{user.user_id}</td>
                    <td>{user.email}</td>
                    <td>{user.team_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Detailed User Info Modal */}
        {selectedUser && (
          <div className="user-details-modal">
            <h3>User Details</h3>
            <p><strong>User ID:</strong> {selectedUser.user_id}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Team ID:</strong> {selectedUser.team_id}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <button onClick={() => setSelectedUser(null)} className="close-btn">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;



