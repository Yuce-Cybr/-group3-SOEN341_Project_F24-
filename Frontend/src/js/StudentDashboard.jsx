import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import supabase from '../components/supabase';
import SidebarComponent from './SidebarComponent';
import '../css/StudentDashboard.css';

const StudentDashboard = () => {
  const { user, role, logout } = useAuth();
  const [teamId, setTeamId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessments, setAssessments] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [submissionNotification, setSubmissionNotification] = useState(null);
  const [completedAssessments, setCompletedAssessments] = useState(0);
  
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

          const initialAssessments = {};
          teamMembersData.forEach(member => {
            initialAssessments[member.email] = {
              ratings: {
                cooperation: 0,
                conceptualContribution: 0,
                practicalContribution: 0,
                workEthic: 0,
              },
              comments: {
                cooperation: '',
                conceptualContribution: '',
                practicalContribution: '',
                workEthic: '',
              },
            };
          });
          setAssessments(initialAssessments);
          setCompletedAssessments(0);
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRatingChange = (memberEmail, dimension, value) => {
    setAssessments((prevAssessments) => ({
      ...prevAssessments,
      [memberEmail]: {
        ...prevAssessments[memberEmail],
        ratings: {
          ...prevAssessments[memberEmail].ratings,
          [dimension]: value,
        },
      },
    }));
  };

  const handleCommentChange = (memberEmail, dimension, value) => {
    setAssessments((prevAssessments) => ({
      ...prevAssessments,
      [memberEmail]: {
        ...prevAssessments[memberEmail],
        comments: {
          ...prevAssessments[memberEmail].comments,
          [dimension]: value,
        },
      },
    }));
  };

  const handleSubmit = (memberEmail) => {
    const { ratings, comments } = assessments[memberEmail];
    const isValid = Object.values(ratings).every((rating) => rating > 0);
    
    if (!isValid) {
      alert("Please rate all dimensions before submitting.");
      return;
    }

    setSubmitted((prevSubmitted) => ({
      ...prevSubmitted,
      [memberEmail]: true,
    }));

    setCompletedAssessments(prev => prev + 1);

    setSubmissionNotification(`Assessment submitted for ${memberEmail}!`);
    setTimeout(() => {
      setSubmissionNotification(null);
    }, 3000);
    setSelectedMember(null);
  };

  const renderProgress = () => {
    const totalMembers = teamMembers.length - 1;
    const progressPercentage = (completedAssessments / totalMembers) * 100;

    return (
      <div className="progress-container">
        <p>Assessment Progress: {completedAssessments}/{totalMembers} completed</p>
        <div className="progress-bar">
          <div
            className="progress-bar-filled"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const handleMemberClick = (memberEmail) => {
    setSelectedMember(selectedMember === memberEmail ? null : memberEmail);
  };

  const renderSubmittedAssessment = (memberEmail) => {
    const { ratings, comments } = assessments[memberEmail];

    return (
      <div className="assessment-review">
        <header className="dashboard-header">
          <h2>Review Assessment for {memberEmail}</h2>
        </header>
        <p>Your submitted assessment for {memberEmail}:</p>
        <div className="submitted-assessment">
          {Object.keys(ratings).map((dimension, index) => (
            <div key={index} className="submitted-section">
              <strong>{dimension.replace(/([A-Z])/g, ' $1')}: </strong>
              <span>{ratings[dimension]}</span>
              <p><em>Comments: {comments[dimension]}</em></p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAssessmentForm = (memberEmail) => {
    const { ratings, comments } = assessments[memberEmail];

    return (
      <div className="peer-assessment">
        <header className="dashboard-header">
          <h2>Peer Assessment for {memberEmail}</h2>
        </header>
        <p>Evaluate your teammate, {memberEmail}, on the following criteria.</p>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(memberEmail); }} className="assessment-form">
          {Object.keys(ratings).map((dimension, index) => (
            <div key={index} className="assessment-section">
              <label className="assessment-label">
                {dimension.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
              </label>

              <div className="rating">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num} className="rating-label">
                    <input
                      type="radio"
                      name={dimension}
                      value={num}
                      checked={ratings[dimension] === num}
                      onChange={() => handleRatingChange(memberEmail, dimension, num)}
                      disabled={submitted[memberEmail]}
                    />
                    {num}
                  </label>
                ))}
              </div>

              <textarea
                className="assessment-comment"
                placeholder={`Comments on ${dimension.replace(/([A-Z])/g, ' $1').toLowerCase()} (optional)`}
                value={comments[dimension]}
                onChange={(e) => handleCommentChange(memberEmail, dimension, e.target.value)}
                disabled={submitted[memberEmail]}
              />
            </div>
          ))}

          <button type="submit" className="submit-button" disabled={submitted[memberEmail]}>
            Submit Assessment
          </button>
        </form>
      </div>
    );
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

        {renderProgress()}

        {submissionNotification && (
          <div className="notification">
            {submissionNotification}
          </div>
        )}

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
                {teamMembers.filter(member => member.email !== user.email).map(member => (
                  <li key={member.email}>
                    <span 
                      onClick={() => handleMemberClick(member.email)} 
                      style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                    >
                      {member.email}
                    </span>
                    {selectedMember === member.email ? (
                      submitted[member.email] ? 
                        renderSubmittedAssessment(member.email) :
                        renderAssessmentForm(member.email)
                    ) : null}
                  </li>
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
