import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from './supabase';
import { useNavigate, useLocation } from 'react-router-dom'; // Add useLocation

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Add this to check current route

  useEffect(() => {
    const fetchUserRole = async (userId) => {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', userId)
        .single();

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
        const fetchedRole = await fetchUserRole(currentUser.id);
        setRole(fetchedRole);

        if (fetchedRole) {
          navigate(`/${fetchedRole.toLowerCase()}-dashboard`);
        }
      } else {
        // Only redirect to login if we're not on the signup page
        const publicRoutes = ['/signup', '/']; // Add any other public routes here
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/');
        }
      }

      setLoading(false);
    };

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(session);
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]); // Add location.pathname to dependencies

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
    navigate('/'); // Navigate to the login page after logout
  };

  if (loading) {
    return <div>Loading user data, please wait...</div>;  
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using AuthContext
export const useAuth = () => useContext(AuthContext);


