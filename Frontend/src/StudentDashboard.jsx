import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import supabase from './supabase';
import SidebarComponent from './SidebarComponent';
import '../src/StudentDashboard.css';

const StudentDashboard = () => {
  const { user, role, logout } = useAuth();
  const [teamId, setTeamId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessments, setAssessments] = useState({}); // Track assessments
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: teamError } = await supabase
          .from('students')
          .select('team_id')
          .eq('email', user.email)
          .single();

        if (teamError) throw teamError;

        setTeamId(data.team_id);

        if (data.team_id) {
          const { data: teamMembersData, error: teamMembersError } = await supabase
            .from('students')
            .select('email')
            .eq('team_id', data.team_id);
          
          if (teamMembersError) throw teamMembersError;

          setTeamMembers(teamMembersData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user.email]);

  if (!user || role !== 'Student') {
    return <Navigate to="/" />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAssessmentSubmit = async (memberEmail, assessment) => {
    // Submit assessment to the database (example logic)
    // Assuming there is an `assessments` table in your database
    try {
      const { error } = await supabase
        .from('assessments')
        .insert([{ assessor_email: user.email, assesse_email: memberEmail, assessment }]);
      
      if (error) throw error;

      // Update assessments state to disable the submitted assessment
      setAssessments((prev) => ({ ...prev, [memberEmail]: true }));
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError(err.message);
    }
  };

  const navigateToPeerAssessment = (memberEmail) => {
    navigate(`/peer-assessment/${memberEmail}`); // Navigate to the peer assessment page for that member
  };

  return (
    <div className="dashboard-container">
      <SidebarComponent />
      <div className="student-dashboard">
        <header className="dashboard-header">
          <h2>Student Dashboard</h2>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
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
          ) : error ? (
            <p>Error fetching data: {error}</p>
          ) : teamId ? (
            <div>
              <h3>Your Team ID: {teamId}</h3>
              <h4>Team Members:</h4>
              <ul>
                {teamMembers.length > 0 ? (
                  teamMembers.map(member => (
                    <li key={member.email}>
                      {member.email}
                      {assessments[member.email] ? (
                        <span> (Assessed)</span>
                      ) : (
                        <div>
                          
                          <button
                            onClick={() => navigateToPeerAssessment(member.email)}
                            disabled={assessments[member.email]} // Disable if already assessed
                          >
                            Go to Peer Assessment
                          </button>
                        </div>
                      )}
                    </li>
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




