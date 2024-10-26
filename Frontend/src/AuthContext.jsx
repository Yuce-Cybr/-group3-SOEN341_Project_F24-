import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from './supabase';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Use `null` instead of `false`
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // Initialize the navigate hook

  useEffect(() => {
    // Function to fetch role from the public.users table
    const fetchUserRole = async (userId) => {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', userId)
        .single();  // Fetch the role for the current user

      if (error) {
        console.error('Error fetching user role:', error.message);
        return null;
      }
      
      return data?.role || null;
    };

    const handleSession = async (session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch the role from the public.users table
        const fetchedRole = await fetchUserRole(currentUser.id);
        setRole(fetchedRole);
        // Navigate based on role
        if (fetchedRole === 'Student') {
          navigate('/student-dashboard');
        }
        if (fetchedRole === 'Instructor') {
          navigate('/instructor-dashboard');
        }
      }

      setLoading(false);
    };

    // Get current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    // Listen to authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(session);
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, [navigate]);  // Add `navigate` to the dependency array

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) {
      throw new Error(error.message);
    }
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  if (loading) {
    return <div>Loading...</div>;  // Show a loading spinner or message
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using AuthContext
export const useAuth = () => useContext(AuthContext);
