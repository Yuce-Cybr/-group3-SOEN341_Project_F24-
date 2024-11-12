import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthContext } from './AuthContext'; // Adjust the import if your path is different

test('renders learn react link', () => {
  // Mock context values
  const mockAuth = { user: null, role: 'guest', loading: false };
  
  render(
    <AuthContext.Provider value={mockAuth}>
      <App />
    </AuthContext.Provider>
  );

  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});






