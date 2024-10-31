import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabase from './supabase';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);  // List of teams
  const [students, setStudents] = useState([]);  // List of available students
  const [selectedTeam, setSelectedTeam] = useState(null);  // Currently selected team for editing
  const [fetchError, setFetchError] = useState(null);

  // Fetch teams from Supabase
  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('instructor_id', user.id);

      if (error) {
        setFetchError('Error fetching teams');
      } else {
        setTeams(data);
      }
    };

    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, email')
        .eq('role', 'Student');

      if (error) {
        setFetchError('Error fetching students');
      } else {
        setStudents(data);
      }
    };

    fetchTeams();
    fetchStudents();
  }, [user]);

  // Create a new team
  const createTeam = async () => {
    const { data, error } = await supabase
      .from('teams')
      .insert([{ instructor_id: user.id }])
      .select();

    if (error) {
      setFetchError('Error creating team');
    } else {
      setTeams((prevTeams) => [...prevTeams, data[0]]);
    }
  };

  // Reset all teams for the instructor
  const resetTeams = async () => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('instructor_id', user.id);

    if (error) {
      setFetchError('Error resetting teams');
    } else {
      setTeams([]); // Clear the local teams state
      setSelectedTeam(null); // Deselect any team currently being edited
    }
  };

  const addStudentToTeam = async (teamId, studentId) => {
    const { error } = await supabase
      .from('team_students')
      .insert([{ team_id: teamId, student_id: studentId }]);  // Only use team_id and student_id
  
    if (error) {
      console.error('Error adding student to team:', error.message);
      setFetchError('Error adding student to team');
    } else {
      // Update selectedTeam state if no error
      setSelectedTeam((prevTeam) => ({
        ...prevTeam,
        students: [...prevTeam.students, studentId],
      }));
    }
  };
  
  // Remove a student from the selected team
  const removeStudentFromTeam = async (teamId, studentId) => {
    const { error } = await supabase
      .from('team_students')
      .delete()
      .match({ team_id: teamId, student_id: studentId });

    if (error) {
      setFetchError('Error removing student from team');
    } else {
      setSelectedTeam((prevTeam) => ({
        ...prevTeam,
        students: prevTeam.students.filter((id) => id !== studentId),
      }));
    }
  };

  // Select a team to edit
  const handleEditTeam = async (team) => {
    const { data: teamStudents, error } = await supabase
      .from('team_students')
      .select('student_id')
      .eq('team_id', team.team_id);

    if (error) {
      setFetchError('Error fetching team students');
    } else {
      setSelectedTeam({
        ...team,
        students: teamStudents.map((student) => student.student_id),
      });
    }
  };

  return (
    <div className="instructor-dashboard">
      <h1>Instructor Dashboard</h1>

      {fetchError && <p className="error">{fetchError}</p>}

      {/* Button to create a new team */}
      <button onClick={createTeam} className="create-team-button">Create Team</button>

      {/* Button to reset all teams */}
      <button onClick={resetTeams} className="reset-teams-button">Reset Teams</button>

      {/* List of teams */}
      <div className="team-list">
        <h2>Your Teams</h2>
        {teams.map((team) => (
          <div key={team.team_id} className="team-item">
            <h3>Team ID: {team.team_id}</h3>
            <button onClick={() => handleEditTeam(team)}>Edit Team</button>
          </div>
        ))}
      </div>

      {/* Team edit panel */}
      {selectedTeam && (
        <div className="team-edit-panel">
          <h2>Editing Team {selectedTeam.team_id}</h2>
          <h3>Current Students</h3>
          <ul>
            {selectedTeam.students.map((studentId) => (
              <li key={studentId}>
                {students.find((s) => s.user_id === studentId)?.email || studentId}
                <button onClick={() => removeStudentFromTeam(selectedTeam.team_id, studentId)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <h3>Add Students</h3>
          <ul>
            {students
              .filter((s) => !selectedTeam.students.includes(s.user_id))
              .map((student) => (
                <li key={student.user_id}>
                  {student.email}
                  <button onClick={() => addStudentToTeam(selectedTeam.team_id, student.user_id)}>
                    Add
                  </button>
                </li>
              ))}
          </ul>
          <button onClick={() => setSelectedTeam(null)}>Done Editing</button>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
