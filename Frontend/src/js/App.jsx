import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../controllers/AuthContext';  // Import the AuthContext
import HomePage from './HomePage';  
import SignUp from './SignUp';      
import StudentDashboard from './StudentDashboard';  
import InstructorDashboard from './InstructorDashboard';  
import PeerAssessment from './PeerAssessment';  

const App = () => {
  const { user, role, loading } = useAuth(); // Get user, role, and loading state

  if (loading) {
    return <div>Loading...</div>; // Show a loading message while fetching user data
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUp />} />
      {/* Protecting student dashboard route */}
      <Route 
        path="/student-dashboard" 
        element={user && role === 'Student' ? <StudentDashboard /> : <Navigate to="/" />} 
      />
      {/* Protecting instructor dashboard route */}
      <Route 
        path="/instructor-dashboard" 
        element={user && role === 'Instructor' ? <InstructorDashboard /> : <Navigate to="/" />} 
      />
      <Route 
        path="/peer-assessment/:memberEmail" 
        element={user && role === 'Student' ? <PeerAssessment /> : <Navigate to="/" />} 
      />
    </Routes>
  );
};

export default App;



