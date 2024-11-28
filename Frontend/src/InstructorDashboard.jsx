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
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [detailedViewData, setDetailedViewData] = useState({
    teamName: '',
    studentName: '',
    members: [],
  });

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
      .select('Accessed_Email, Ratings')
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

        return { ...assessment, average };
      });
      setSummaryData(formattedData);
    }
    setLoading(false);
  };

  // Fetch detailed view data
  const fetchDetailedViewData = async (teamName, accessedEmail) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assessments')
      .select('Accessor_email, Ratings, Comments')
      .eq('team_name', teamName)
      .eq('Accessed_Email', accessedEmail);

    if (error) {
      console.error('Error fetching detailed view data:', error);
      setLoading(false);
      return null;
    }

    const formattedData = data.map((item) => {
      const { Ratings } = item;
      const average =
        (Ratings.cooperation +
          Ratings.conceptual +
          Ratings.practical +
          Ratings.work_ethic) /
        4;

      return {
        name: item.Accessor_email,
        cooperation: Ratings.cooperation,
        conceptual: Ratings.conceptual,
        practical: Ratings.practical,
        workEthic: Ratings.work_ethic,
        average,
        comment: item.Comments,
      };
    });

    setLoading(false);
    return {
      teamName,
      studentName: accessedEmail,
      members: formattedData,
    };
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

  const openDetailedView = async (teamName, accessedEmail) => {
    const detailedData = await fetchDetailedViewData(teamName, accessedEmail);

    if (detailedData) {
      setDetailedViewData(detailedData);
      setIsDetailedViewOpen(true);
    } else {
      console.error('Failed to fetch detailed view data.');
    }
  };

  const closeDetailedView = () => {
    setIsDetailedViewOpen(false);
    setDetailedViewData({ teamName: '', studentName: '', members: [] });
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
                    <th>Member ID</th>
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
                      <td>{student.Accessed_Email}</td>
                      <td>{student.Ratings.cooperation}</td>
                      <td>{student.Ratings.conceptualContribution}</td>
                      <td>{student.Ratings.practicalContribution}</td>
                      <td>{student.Ratings.workEthic}</td>
                      <td>{student.average.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : isDetailedViewOpen ? (
            <div>
              <h2>Detailed View</h2>
              <p><strong>Team Name:</strong> {detailedViewData.teamName}</p>
              <p><strong>Student Name:</strong> {detailedViewData.studentName}</p>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Cooperation</th>
                    <th>Conceptual</th>
                    <th>Practical</th>
                    <th>Work Ethic</th>
                    <th>Average Across All</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedViewData.members.map((member, index) => (
                    <tr key={index}>
                      <td>{member.name}</td>
                      <td>{member.cooperation}</td>
                      <td>{member.conceptual}</td>
                      <td>{member.practical}</td>
                      <td>{member.workEthic}</td>
                      <td>{member.average.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h4>Comments:</h4>
              {detailedViewData.members.map((member, index) => (
                <p key={index}>
                  <strong>{member.name} comment:</strong> {member.comment || "No comments"}
                </p>
              ))}
              <button onClick={closeDetailedView} className="close-btn">
                Close Detailed View
              </button>
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
                      <td>
                        <button
                          onClick={() =>
                            openDetailedView(
                              teams.find(team => team.team_id === user.team_id)?.team_id,
                              user.email
                            )
                          }
                        >
                          View Details
                        </button>
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
