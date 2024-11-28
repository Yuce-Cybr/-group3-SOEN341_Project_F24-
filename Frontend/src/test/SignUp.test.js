import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import supabase from '../components/supabase';
import SignUp from './SignUp';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('../components/supabase');

describe('SignUp', () => {
  const mockNavigate = jest.fn();
  const mockSignUp = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    supabase.auth.signUp = mockSignUp;
  });

  test('renders input fields and Sign Up button', () => {
    render(<SignUp />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password (min 8 characters)')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('displays error message for invalid inputs', () => {
    render(<SignUp />);
    const signUpButton = screen.getByText('Sign Up');

    fireEvent.click(signUpButton);

    expect(screen.getByText('Please enter a valid email and password (min 8 characters).')).toBeInTheDocument();
  });

  test('calls supabase signUp and shows success message', async () => {
    supabase.auth.signUp.mockResolvedValue({ error: null });

    render(<SignUp />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password (min 8 characters)');
    const signUpButton = screen.getByText('Sign Up');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signUpButton);

    expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    expect(await screen.findByText('Sign-up successful! Redirecting to login...')).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('displays error message if sign-up fails', async () => {
    supabase.auth.signUp.mockResolvedValue({ error: { message: 'Email already exists' } });

    render(<SignUp />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password (min 8 characters)');
    const signUpButton = screen.getByText('Sign Up');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signUpButton);

    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
  });
});
