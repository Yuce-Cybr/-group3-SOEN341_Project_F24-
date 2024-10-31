import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';
import supabase from './supabase';
import SidebarComponent from './SidebarComponent';
import '../src/StudentDashboard.css';

  const StudentDashboard = () => {
  const { user, role, logout } = useAuth();
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      const { data: teamData, error: teamError } = await supabase
        .from('students')
        .select('*, members:students(email, team_id)')
        .eq('team_id', user.team_id)
        .single();

      if (teamError) {
        console.error('Error fetching team data:', teamError);
      } else {
        setTeam(teamData);
        setTeamMembers(teamData.members);
      }
      setLoading(false);
    };

    if (user.team_id) {
      fetchTeamData();
    } else {
      setLoading(false);
    }
  }, [user.team_id]);

  if (!user || role !== 'Student') {
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard-container">
      <SidebarComponent />
      <div className="student-dashboard">
        <header className="dashboard-header">
          <h2>Student Dashboard</h2>
          <button onClick={logout} className="logout-btn">Logout</button>
        </header>

        <section className="profile-card">
          <h3>Your Profile</h3>
          <p><strong>Name:</strong> {user.name || "Student"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {role}</p>
        </section>

        <section className="team-info">
          {loading ? (
            <p>Loading team data...</p>
          ) : team ? (
            <div>
              <h3>Your Team: {team.team_id}</h3>
              <h4>Team Members:</h4>
              <ul>
                {teamMembers.map(member => (
                  <li key={member.email}>{member.email}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>You are not assigned to any team.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;

