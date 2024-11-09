// Import necessary dependencies
import { render } from '@testing-library/react';
import { AuthProvider } from './AuthContext'; // Ensure this path matches your project structure
import App from './App';

// Wrap App in the AuthProvider to mock context values
test('renders learn react link', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  // Your existing test code here, e.g., checking for elements or text
});



