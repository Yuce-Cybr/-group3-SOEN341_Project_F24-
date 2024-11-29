import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from '../components/AuthContext';
import HomePage from './HomePage.jsx';

jest.mock('../components/AuthContext'); // Mock the AuthContext

describe('HomePage', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Ensure no residual mocks between tests
    useAuth.mockReturnValue({ login: mockLogin });
  });

  test('renders input fields, role dropdown, and buttons', () => {
    render(<HomePage />);
    // Verify input fields
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    // Verify dropdown and buttons
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  test('updates input fields and calls login on Sign In', () => {
    render(<HomePage />);
    // Get input fields, dropdown, and button
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const roleSelect = screen.getByRole('combobox');
    const signInButton = screen.getByText(/sign in/i);

    // Simulate user input
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(roleSelect, { target: { value: 'Instructor' } });

    // Simulate button click
    fireEvent.click(signInButton);

    // Verify the login function is called with the correct arguments
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', 'Instructor');
  });

  test('displays an error message if email or password is missing', () => {
    render(<HomePage />);
    const signInButton = screen.getByText(/sign in/i);

    // Simulate button click without entering email or password
    fireEvent.click(signInButton);

    // Verify the error message is displayed
    expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
  });

  test('allows navigation to the Sign Up page', () => {
    const mockNavigate = jest.fn();
    useAuth.mockReturnValue({ login: mockLogin, navigate: mockNavigate });

    render(<HomePage />);
    const signUpButton = screen.getByText(/sign up/i);

    // Simulate Sign Up button click
    fireEvent.click(signUpButton);

    // Verify navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });
});
