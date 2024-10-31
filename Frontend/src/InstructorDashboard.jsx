import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';
import supabase from './supabase';
import SidebarComponent from './SidebarComponent';
import '../src/InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user, role, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsersAndTeams = async () => {
      setLoading(true);
      const { data: usersData, error: usersError } = await supabase.from('users').select();
      const { data: teamsData, error: teamsError } = await supabase.from('teams').select();

      if (usersError || teamsError) {
        console.error('Error fetching data:', usersError || teamsError);
      } else {
        setUsers(usersData);
        setTeams(teamsData);
      }
      setLoading(false);
    };
    fetchUsersAndTeams();
  }, []);

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => setCsvData(results.data),
        error: (error) => console.error('Error parsing CSV:', error),
      });
    }
  };

  const handleImportCsv = async () => {
    if (csvData) {
      const newUsers = csvData.map(row => ({
        email: row.Email,
        name: row.Name,
        team_id: row.TeamID,
        role: 'Student',
      }));

      const { error } = await supabase.from('users').insert(newUsers);
      if (error) {
        console.error('Error importing users:', error);
      } else {
        setUsers([...users, ...newUsers]);
      }
    }
  };

  const handleCreateTeam = async () => {
    if (newTeamName) {
      const { data, error } = await supabase.from('teams').insert([{ name: newTeamName }]);
      if (error) {
        console.error('Error creating team:', error);
      } else {
        setTeams([...teams, ...data]);
        setNewTeamName('');
        setIsAddTeamModalOpen(false);
      }
    }
  };

  const handleAssignTeam = async (userId, teamId) => {
    const { error } = await supabase.from('users').update({ team_id: teamId }).eq('user_id', userId);
    if (error) {
      console.error('Error assigning team:', error);
    } else {
      setUsers(users.map(user => (user.user_id === userId ? { ...user, team_id: teamId } : user)));
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
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

        <section className="profile-card">
          <h3>Instructor Profile</h3>
          <p><strong>Name:</strong> {user.name || "Instructor"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {role}</p>
        </section>

        <section className="actions">
          <input type="file" accept=".csv" onChange={handleCsvUpload} />
          <button onClick={handleImportCsv} disabled={!csvData}>Import CSV</button>
          <button onClick={() => setIsAddTeamModalOpen(true)}>Add Team</button>
        </section>

        <section className="search-bar">
          <input
            type="text"
            placeholder="Search by email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </section>

        <section className="users-table">
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Team</th>
                  <th>Assign Team</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.user_id}>
                    <td onClick={() => setSelectedUser(user)}>{user.user_id}</td>
                    <td onClick={() => setSelectedUser(user)}>{user.email}</td>
                    <td>{teams.find(team => team.team_id === user.team_id)?.name || 'Unassigned'}</td>
                    <td>
                      <select
                        value={user.team_id || ''}
                        onChange={(e) => handleAssignTeam(user.user_id, e.target.value)}
                      >
                        <option value="">Select Team</option>
                        {teams.map(team => (
                          <option key={team.team_id} value={team.team_id}>{team.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {isAddTeamModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Create New Team</h3>
              <input
                type="text"
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <button onClick={handleCreateTeam} className="confirm-btn">Create Team</button>
              <button onClick={() => setIsAddTeamModalOpen(false)} className="close-btn">Cancel</button>
            </div>
          </div>
        )}

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



