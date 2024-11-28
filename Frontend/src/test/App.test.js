import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../js/App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i); // Likely failing here
  expect(linkElement).toBeInTheDocument();
});
