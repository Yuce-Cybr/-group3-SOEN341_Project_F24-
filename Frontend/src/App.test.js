// Import necessary libraries and components
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // for extra matchers like 'toBeInTheDocument'
import App from './App';
import { AuthContext } from './AuthContext'; // Ensure the path is correct

// Define a mockAuth object with necessary properties and methods
const mockAuth = {
  isAuthenticated: true, // Set based on what you want to test
  user: { name: 'Test User', role: 'Student' },
  login: jest.fn(),
  logout: jest.fn(),
};

// Write the test
test('renders learn react link', () => {
  // Wrap App component with AuthContext provider using the mockAuth object
  render(
    <AuthContext.Provider value={mockAuth}>
      <App />
    </AuthContext.Provider>
  );

  // Check for the presence of "learn react" link
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});







