import React from 'react';
import { useAuth } from './AuthContext'; // Make sure the import path is correct
import { Navigate } from 'react-router-dom';
import supabase from './supabase';
import { useEffect, useState } from 'react';
import Papa from 'papaparse'

const InstructorDashboard = () => {
  //const { user, role } = useAuth();  // Correctly destructure user and role from the AuthContext
  const [fetchError, setFetchError] = useState(null)
  const [users, setUsers] = useState(null)
  const [files, setFiles] = useState([])
  
  async function name(params) {
    
  }

  const changeFiles = (e) => {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        const columnArray = [];
        const valueArray = [];

        result.data.map((d) => {
           valueArray.push(Object.values(d))
        })
        for (let i=0; i<valueArray.length; i++) {
          console.log(valueArray)
            const sendData = async() => {
              const {data, error} =await supabase
                .from('students')
                .upsert({email:valueArray[i][0], team:valueArray[i][1]})
                .select()
          }
          sendData();
        }
      }
    })

    //const sendData = async() => {
    //  const { data, error } = await supabase
    //    .from('users')
    //    .select()
    //}
  }

  const uploadFiles = (e) => {
    e.preventDefault();
    console.log(files)
  }

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
            <th>Team ID</th>
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
      <form onSubmit={uploadFiles}>
        <input type="file" name="filename" accept='.csv' onChange={changeFiles}></input>
        <input type="submit"></input>
      </form>
    </div>



  );
};

export default InstructorDashboard;

