import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from './supabase';
import { useNavigate } from 'react-router-dom'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUserRole = async (userId) => {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error.message);
        return null; // Consider also returning a default role if needed
      }
      
      return data?.role || null;
    };

    const handleSession = async (session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const fetchedRole = await fetchUserRole(currentUser.id);
        setRole(fetchedRole);

        // Navigate based on role
        if (fetchedRole) {
          navigate(`/${fetchedRole.toLowerCase()}-dashboard`); // Dynamic routing based on role
        }
      } else {
        // No user logged in, maybe redirect to login
        navigate('/');
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
  }, [navigate]); 

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


