import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';
import supabase from './supabase';
import SidebarComponent from './SidebarComponent';
import '../src/InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user, role, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [isSummaryViewOpen, setIsSummaryViewOpen] = useState(false);
  const [summaryData, setSummaryData] = useState([]);

  // Fetch users and teams
  const fetchUsersAndTeams = async () => {
    setLoading(true);
    const { data: usersData, error: usersError } = await supabase.from('students').select();
    const { data: teamsData, error: teamsError } = await supabase.from('teams').select();

    if (usersError || teamsError) {
      console.error('Error fetching data:', usersError || teamsError);
    } else {
      setUsers(usersData);
      setTeams(teamsData);
    }
    setLoading(false);
  };

  // Fetch summary data
  const fetchSummaryData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Assessments')
      .select('Team_name, Student_ID, First_name, Last_name, Ratings')
      .not('Ratings', 'is', null);

    if (error) {
      console.error("Error fetching summary data:", error);
    } else {
      const formattedData = data.map((assessment) => {
        const ratings = assessment.Ratings;
        const average =
          (ratings.cooperation +
            ratings.conceptualContribution +
            ratings.practicalContribution +
            ratings.workEthic) / 4;

        return {
          team_name: assessment.Team_name,
          student_ID: assessment.Student_ID,
          first_name: assessment.First_name,
          last_name: assessment.Last_name,
          cooperation: ratings.cooperation,
          conceptualContribution: ratings.conceptualContribution,
          practicalContribution: ratings.practicalContribution,
          workEthic: ratings.workEthic,
          average,
        };
      });
      setSummaryData(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsersAndTeams();
  }, []);

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => setCsvData(results.data),
        error: (error) => console.error('Error parsing CSV:', error),
      });
    }
  };

  const handleImportCsv = async () => {
    if (csvData) {
      const newUsers = csvData.map(row => ({
        email: row.email,
        team_id: row.team_id,
      }));

      const { error } = await supabase.from('students').upsert(newUsers);
      if (error) {
        console.error('Error importing users:', error);
      } else {
        fetchUsersAndTeams();
      }
    }
  };

  const handleCreateTeam = async () => {
    if (newTeamName) {
      const { error } = await supabase.from('teams').upsert([{ team_id: newTeamName }]);
      if (error) {
        console.error('Error creating team:', error);
      } else {
        fetchUsersAndTeams();
        setNewTeamName('');
        setIsAddTeamModalOpen(false);
      }
    }
  };

  const handleAssignTeam = async (userId, teamId) => {
    const { error } = await supabase.from('students').update({ team_id: teamId }).eq('email', userId);
    if (error) {
      console.error('Error assigning team:', error);
    } else {
      fetchUsersAndTeams();
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSummaryView = () => {
    if (isSummaryViewOpen) {
      setIsSummaryViewOpen(false);
    } else {
      fetchSummaryData();
      setIsSummaryViewOpen(true);
    }
  };

  if (!user || role !== 'Instructor') {
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard-container">
      <SidebarComponent />
      <div className="instructor-dashboard">
        <header className="dashboard-header">
          <h2>Instructor Dashboard</h2>
          <button onClick={logout} className="logout-btn">Logout</button>
        </header>

        <section className="profile-card">
          <h3>Instructor Profile</h3>
          <p><strong>Name:</strong> {user.name || "Instructor"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {role}</p>
        </section>

        <section className="actions">
          <input type="file" accept=".csv" onChange={handleCsvUpload} />
          <button onClick={handleImportCsv} disabled={!csvData}>Import CSV</button>
          <button onClick={() => setIsAddTeamModalOpen(true)}>Add Team</button>
          <button onClick={toggleSummaryView}>
            {isSummaryViewOpen ? 'Back to User Table' : 'Summary View'}
          </button>
        </section>

        <section className="users-table">
          {loading ? (
            <p>Loading...</p>
          ) : isSummaryViewOpen ? (
            <div>
              <h2>Summary of Results</h2>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Student ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Cooperation</th>
                    <th>Conceptual Contribution</th>
                    <th>Practical Contribution</th>
                    <th>Work Ethic</th>
                    <th>Average</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((student, index) => (
                    <tr key={index}>
                      <td>{student.team_name}</td>
                      <td>{student.student_ID}</td>
                      <td>{student.first_name}</td>
                      <td>{student.last_name}</td>
                      <td>{student.cooperation}</td>
                      <td>{student.conceptualContribution}</td>
                      <td>{student.practicalContribution}</td>
                      <td>{student.workEthic}</td>
                      <td>{student.average.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <h2>User List</h2>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Email</th>
                    <th>Team</th>
                    <th>Assign Team</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.user_id}>
                      <td>{user.user_id}</td>
                      <td>{user.email}</td>
                      <td>{teams.find(team => team.team_id === user.team_id)?.team_id || 'Unassigned'}</td>
                      <td>
                        <select
                          value={user.team_id || ''}
                          onChange={(e) => handleAssignTeam(user.email, e.target.value)}
                        >
                          <option value="">Select Team</option>
                          {teams.map(team => (
                            <option key={team.team_id} value={team.team_id}>
                              {team.team_id}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default InstructorDashboard;
