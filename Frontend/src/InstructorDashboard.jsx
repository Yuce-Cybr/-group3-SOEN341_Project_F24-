import React from 'react';
import { useAuth } from './AuthContext'; // Make sure the import path is correct
import { Navigate } from 'react-router-dom';
import supabase from './supabase';
import { useEffect, useState } from 'react';

const InstructorDashboard = () => {
  //const { user, role } = useAuth();  // Correctly destructure user and role from the AuthContext
  const [fetchError, setFetchError] = useState(null)
  const [users, setUsers] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select()

      if (error) {
        setFetchError('Could not fetch user id')
        setUsers(null)
        console.log(error)
      }

      if (data) {
        setUsers(data)
        setFetchError(null)
      }
    }
    fetchUsers()
  }, [])

  // Redirect if user is not authenticated or not an instructor
  //if (!user || role !== 'Instructor') {
  //return <Navigate to="/" />;
  //}

  return (
    <div className='instructor'>
      <table className="table ">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Email</th>
            <th>User ID</th>
          </tr>
        </thead>
        <tbody>
          {users && (users.map(user => (
            <tr>
              <td>{user.user_id}</td>
              <td>{user.email}</td>
              <td>{user.team_id}</td>
            </tr>
          )
          ))}
        </tbody>
      </table>
      {fetchError && (<p>{fetchError}</p>)}
      {users && (
        <div className='usersid'>
          {users.map(user => (
            <p>{user.email}{user.role}</p>
          ))}
        </div>
      )}

    </div>


  );
};

export default InstructorDashboard;

