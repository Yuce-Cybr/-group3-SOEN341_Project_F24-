import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Needed for routing
import App from '../js/App';

test('renders application title on the home page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // Replace 'RateMyPeer' with the actual text from your HomePage.jsx
  const titleElement = screen.getByText(/RateMyPeer/i); 
  expect(titleElement).toBeInTheDocument();
});
