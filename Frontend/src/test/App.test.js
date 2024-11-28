import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../js/App';

test('renders the home page title', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const titleElement = screen.getByText(/RateMyPeer/i); // Replace with actual title text
  expect(titleElement).toBeInTheDocument();
});
