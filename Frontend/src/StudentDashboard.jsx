import React from 'react';
import { useAuth } from './AuthContext';  // Import useAuth for login function


const StudentDashboard = () => {
    const { role } = useAuth();  // Get login function and user state from AuthContext
     
  return (
    <div>
      <h1>Welcome to the {role} Dashboard!</h1>
    </div>
  );
};

export default StudentDashboard;
