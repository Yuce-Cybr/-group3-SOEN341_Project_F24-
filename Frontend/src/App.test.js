import React from 'react'; // Ensure this is present at the top
import { render } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './AuthContext';

test('renders learn react link', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
});




