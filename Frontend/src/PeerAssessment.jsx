import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate, useParams } from 'react-router-dom';
import SidebarComponent from './SidebarComponent';
import '../src/PeerAssessment.css'; // Add your styles here

const PeerAssessment = () => {
const { user, role  } = useAuth();
  const { memberEmail } = useParams(); // Get the member's email from the URL parameters

  // Check if the user is authenticated and is a Student


  return (
    <div className="assessment-container">
      <SidebarComponent />
      <div className="peer-assessment">
        <header className="dashboard-header">
          <h2>Peer Assessment for {memberEmail}</h2>
        </header>
        <p>This is the Peer Assessment page where you can evaluate your teammate {memberEmail}.</p>
        {/* Add your assessment form here */}
      </div>
    </div>
  );
};

export default PeerAssessment;





