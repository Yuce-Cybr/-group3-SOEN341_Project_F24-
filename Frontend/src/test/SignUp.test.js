import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import supabase from '../components/supabase';
import SignUp from './SignUp.jsx';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../components/supabase', () => ({
  auth: {
    signUp: jest.fn(),
  },
}));

describe('SignUp Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks to ensure clean test state
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders input fields and Sign Up button', () => {
    render(<SignUp />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password \(min 8 characters\)/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  test('displays error message for invalid inputs', () => {
    render(<SignUp />);
    const signUpButton = screen.getByText(/sign up/i);

    fireEvent.click(signUpButton);

    expect(screen.getByText(/please enter a valid email and password \(min 8 characters\)/i)).toBeInTheDocument();
  });

  test('calls supabase signUp and shows success message', async () => {
    supabase.auth.signUp.mockResolvedValue({ error: null });

    render(<SignUp />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password \(min 8 characters\)/i);
    const signUpButton = screen.getByText(/sign up/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signUpButton);

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(await screen.findByText(/sign-up successful! redirecting to login/i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('displays error message if sign-up fails', async () => {
    supabase.auth.signUp.mockResolvedValue({ error: { message: 'Email already exists' } });

    render(<SignUp />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password \(min 8 characters\)/i);
    const signUpButton = screen.getByText(/sign up/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signUpButton);

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  });
});
