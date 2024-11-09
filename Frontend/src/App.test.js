import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './AuthContext'; // Import your AuthProvider

test('renders learn react link', () => {
  render(
    <AuthProvider>  {/* Wrap App with AuthProvider */}
      <App />
    </AuthProvider>
  );
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

