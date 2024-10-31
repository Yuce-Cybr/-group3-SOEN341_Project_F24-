import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Link } from 'react-router-dom';
import supabase from './supabase';
import SidebarComponent from './SidebarComponent';
import '../src/StudentDashboard.css';

const StudentDashboard = () => {
  const { user, role, logout } = useAuth();
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debug logs
  useEffect(() => {
    console.log('User:', user);
    console.log('Role:', role);
  }, [user, role]);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      if (user && user.team_id) {
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
      } else {
        // No user or team_id, handle appropriately
        setTeam(null);
        setTeamMembers([]);
      }
      setLoading(false);
    };

    fetchTeamData();
  }, [user]);

  // Redirect if user is not logged in or not a student
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

        {/* Add Link to Peer Assessment */}
        <section className="peer-assessment-link">
          <Link to="/peer-assessment" className="peer-assessment-btn">
            Go to Peer Assessment
          </Link>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;




