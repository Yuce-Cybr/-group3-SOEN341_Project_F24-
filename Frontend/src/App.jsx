import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';  // HomePage for Login
import SignUp from './SignUp';      // SignUp Page for new account creation
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />  {/* Login Page */}
      <Route path="/signup" element={<SignUp />} />  {/* Sign-Up Page */}
      <Route path="/student-dashboard" element={<StudentDashboard/>} />  {/* Sign-Up Page */}
      <Route path="/instructor-dashboard" element={<InstructorDashboard/>} />  {/* Sign-Up Page */}
    </Routes>
  );
};

export default App;
