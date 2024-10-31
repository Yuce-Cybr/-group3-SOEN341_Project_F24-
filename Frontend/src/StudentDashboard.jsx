import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';
import supabase from './supabase';
import SidebarComponent from './SidebarComponent';
import '../src/StudentDashboard.css';

const StudentDashboard = () => {
  const { user, role, logout } = useAuth();
  const [teamId, setTeamId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true); // Start loading
      const { data, error } = await supabase
        .from('students')
        .select('team_id')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching team data:', error);
      } else {
        setTeamId(data.team_id); // Save team_id

        // Fetch team members based on team_id
        if (data.team_id) {
          const { data: teamMembersData, error: teamMembersError } = await supabase
            .from('students')
            .select('email')
            .eq('team_id', data.team_id);
            console.log(teamMembersData);

          if (teamMembersError) {
            console.error('Error fetching team members:', teamMembersError);
          } else {
            setTeamMembers(teamMembersData); // Save team members
          }
        }
      }
      setLoading(false); // Stop loading
    };

    fetchTeamData();
  }, [user.email]); // Depend on user.email to refetch if it changes

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
          ) : teamId ? (
            <div>
              <h3>Your Team ID: {teamId}</h3>
              <h4>Team Members:</h4>
              <ul>
                {teamMembers.length > 0 ? (
                  teamMembers.map(member => (
                    <li key={member.email}>{member.email}</li>
                  ))
                ) : (
                  <li>No team members found.</li>
                )}
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