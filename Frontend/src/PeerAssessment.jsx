import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabase from './supabase';
import '../src/PeerAssessment.css';
import { Navigate } from 'react-router-dom';

const PeerAssessment = () => {
  const { user, role } = useAuth();
  const [selectedTeammate, setSelectedTeammate] = useState(null);
  const [ratings, setRatings] = useState({
    cooperation: 3,
    conceptualContribution: 3,
    practicalContribution: 3,
    workEthic: 3,
  });
  const [comments, setComments] = useState({
    cooperation: '',
    conceptualContribution: '',
    practicalContribution: '',
    workEthic: '',
  });
  const [teammates, setTeammates] = useState([]);

  // Log user and role for debugging
  useEffect(() => {
    console.log('User:', user);
    console.log('Role:', role);
  }, [user, role]);

  // Fetch teammates when the component mounts
  useEffect(() => {
    const fetchTeammates = async () => {
      if (user && user.team_id) {
        const { data, error } = await supabase
          .from('students')
          .select('email')
          .eq('team_id', user.team_id)  // Fetch teammates in the same team
          .neq('email', user.email); // Exclude the logged-in user
        
        if (error) {
          console.error('Error fetching teammates:', error);
        } else {
          setTeammates(data);
        }
      }
    };
    fetchTeammates();
  }, [user]);

  // Handle selecting a teammate for assessment
  const handleSelectTeammate = (teammate) => {
    setSelectedTeammate(teammate);
    setRatings({
      cooperation: 3,
      conceptualContribution: 3,
      practicalContribution: 3,
      workEthic: 3,
    });
    setComments({
      cooperation: '',
      conceptualContribution: '',
      practicalContribution: '',
      workEthic: '',
    });
  };

  // Handle changes in rating input
  const handleRatingChange = (dimension, value) => {
    setRatings((prevRatings) => ({ ...prevRatings, [dimension]: value }));
  };

  // Handle changes in comment textarea
  const handleCommentChange = (dimension, value) => {
    setComments((prevComments) => ({ ...prevComments, [dimension]: value }));
  };

  // Handle form submission for peer assessment
  const handleSubmitAssessment = () => {
    console.log("Peer Assessment Submitted:", {
      teammate: selectedTeammate,
      ratings,
      comments,
    });
    alert("Peer assessment submitted successfully!");
    setSelectedTeammate(null); // Reset the selected teammate
  };

  // Check if user is logged in and has the correct role
  if (!user || role !== 'Student') {
    return <Navigate to="/" />; // Redirect if not a student
  }

  return (
    <div className="peer-assessment-container">
      <h2>Peer Assessment</h2>
      
      {selectedTeammate ? (
        <div>
          <h3>Evaluate {selectedTeammate.email}</h3>
          {['cooperation', 'conceptualContribution', 'practicalContribution', 'workEthic'].map((dimension) => (
            <div key={dimension} className="assessment-item">
              <label>
                {dimension.charAt(0).toUpperCase() + dimension.slice(1)} (1-5): 
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={ratings[dimension]}
                  onChange={(e) => handleRatingChange(dimension, parseInt(e.target.value))}
                />
              </label>
              <textarea
                placeholder={`Comments on ${dimension}`}
                value={comments[dimension]}
                onChange={(e) => handleCommentChange(dimension, e.target.value)}
              />
            </div>
          ))}
          <button onClick={handleSubmitAssessment} className="submit-btn">Confirm Submission</button>
        </div>
      ) : (
        <div>
          <h3>Select Teammate for Evaluation</h3>
          <ul>
            {teammates.map(teammate => (
              <li key={teammate.email}>
                <button onClick={() => handleSelectTeammate(teammate)}>
                  {teammate.email}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PeerAssessment;



