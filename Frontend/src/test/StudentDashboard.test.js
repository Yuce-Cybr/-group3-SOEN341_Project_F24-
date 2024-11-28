import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from '../components/AuthContext';
import supabase from '../components/supabase';
import StudentDashboard from './StudentDashboard';

jest.mock('../components/AuthContext');
jest.mock('../components/supabase');

describe('StudentDashboard', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com', name: 'Test User' },
      role: 'Student',
      logout: jest.fn(),
    });

    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [{ email: 'teamMember1@example.com', team_id: 1 }],
        error: null,
      }),
    }));
  });

  test('renders student dashboard with profile and progress', async () => {
    render(<StudentDashboard />);
    expect(await screen.findByText('Test User')).toBeInTheDocument();
    expect(await screen.findByText('Your Team ID: 1')).toBeInTheDocument();
  });
});
