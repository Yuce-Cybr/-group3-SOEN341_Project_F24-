import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../js/App'; // Adjust the path as needed

test('renders the home page title', () => {
  render(<App />);
  const titleElement = screen.getByText(/RateMyPeer/i); // Replace with the actual title text
  expect(titleElement).toBeInTheDocument();
});
