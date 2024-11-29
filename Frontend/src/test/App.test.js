import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../js/App';

// Mock the AuthContext
jest.mock('../components/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { email: 'test@example.com' },
    role: 'Student',
    loading: false,
  })),
}));

test('renders application title on the home page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  const titleElement = screen.getByText(/RateMyPeer/i);
  expect(titleElement).toBeInTheDocument();
});
