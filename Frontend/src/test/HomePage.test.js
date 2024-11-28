import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from '../components/AuthContext';
import HomePage from './HomePage';

jest.mock('../components/AuthContext'); // Mock the AuthContext

describe('HomePage', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ login: mockLogin });
  });

  test('renders input fields and buttons', () => {
    render(<HomePage />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('updates input fields and calls login on Sign In', () => {
    render(<HomePage />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const roleSelect = screen.getByRole('combobox');
    const signInButton = screen.getByText('Sign In');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(roleSelect, { target: { value: 'Instructor' } });

    fireEvent.click(signInButton);

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', 'Instructor');
  });

  test('displays an error message if email or password is missing', () => {
    render(<HomePage />);
    const signInButton = screen.getByText('Sign In');

    fireEvent.click(signInButton);

    expect(screen.getByText('Please enter both email and password.')).toBeInTheDocument();
  });
});
