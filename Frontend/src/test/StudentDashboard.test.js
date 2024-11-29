import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../components/AuthContext';
import supabase from '../components/supabase';
import StudentDashboard from './StudentDashboard';

jest.mock('../components/AuthContext');
jest.mock('../components/supabase');

describe('StudentDashboard', () => {
  beforeEach(() => {
    // Mock the useAuth hook
    useAuth.mockReturnValue({
      user: { email: 'test@example.com', name: 'Test User' },
      role: 'Student',
      logout: jest.fn(),
    });

    // Mock the supabase query
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [
          { email: 'teamMember1@example.com', team_id: 1 },
          { email: 'teamMember2@example.com', team_id: 1 },
        ],
        error: null,
      }),
    }));
  });

  test('renders student dashboard with profile and progress', async () => {
    render(<StudentDashboard />);

    // Verify the user profile information is displayed
    expect(await screen.findByText('Test User')).toBeInTheDocument();
    expect(await screen.findByText('test@example.com')).toBeInTheDocument();

    // Verify the team ID is displayed
    expect(await screen.findByText('Your Team ID: 1')).toBeInTheDocument();

    // Verify the progress bar is displayed
    expect(screen.getByText(/assessment progress/i)).toBeInTheDocument();
  });

  test('renders team members', async () => {
    render(<StudentDashboard />);

    // Verify team members are displayed
    expect(await screen.findByText('teamMember1@example.com')).toBeInTheDocument();
    expect(await screen.findByText('teamMember2@example.com')).toBeInTheDocument();
  });

  test('handles logout', async () => {
    const mockLogout = jest.fn();
    useAuth.mockReturnValue({
      user: { email: 'test@example.com', name: 'Test User' },
      role: 'Student',
      logout: mockLogout,
    });

    render(<StudentDashboard />);

    // Click the logout button
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  test('shows error message if fetching team data fails', async () => {
    // Mock an error response from supabase
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch team data' },
      }),
    }));

    render(<StudentDashboard />);

    // Verify error message is displayed
    expect(await screen.findByText(/failed to fetch team data/i)).toBeInTheDocument();
  });

  test('allows submitting assessments for team members', async () => {
    render(<StudentDashboard />);

    // Wait for team members to load
    await waitFor(() => screen.findByText('teamMember1@example.com'));

    // Click on a team member to open the assessment form
    const teamMember = screen.getByText('teamMember1@example.com');
    fireEvent.click(teamMember);

    // Fill in ratings
    const cooperationRating = screen.getByLabelText(/cooperation/i);
    fireEvent.change(cooperationRating, { target: { value: 5 } });

    const conceptualContributionRating = screen.getByLabelText(/conceptual contribution/i);
    fireEvent.change(conceptualContributionRating, { target: { value: 4 } });

    const practicalContributionRating = screen.getByLabelText(/practical contribution/i);
    fireEvent.change(practicalContributionRating, { target: { value: 3 } });

    const workEthicRating = screen.getByLabelText(/work ethic/i);
    fireEvent.change(workEthicRating, { target: { value: 5 } });

    // Submit the assessment
    const submitButton = screen.getByText(/submit assessment/i);
    fireEvent.click(submitButton);

    // Verify the success message is displayed
    expect(await screen.findByText(/assessment submitted for teamMember1@example.com/i)).toBeInTheDocument();
  });
});
