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
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSummaryViewOpen, setIsSummaryViewOpen] = useState(false);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  const openSummaryView = () => setIsSummaryViewOpen(true);
  const closeSummaryView = () => setIsSummaryViewOpen(false);
  const openDetailedView = () => setIsDetailedViewOpen(true);
  const closeDetailedView = () => setIsDetailedViewOpen(false);

  useEffect(() => {
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
      console.log(csvData);
      const newUsers = csvData.map(row => ({
        email: row.email,
        team_id: row.team_id,
      }));
      
      const { error } = await supabase.from('students').upsert(newUsers);
      if (error) {
        console.error('Error importing users:', error);
      } else {
        setUsers([...users, ...newUsers]);
      }
    }
  };

  const handleCreateTeam = async () => {
    if (newTeamName) {
      const { error } = await supabase.from('teams').upsert([{ team_id: newTeamName }]);
      if (error) {
        console.error('Error creating team:', error);
      } else {
        const { data } = await supabase.from('teams').select('*');
        setTeams(data);
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
      setUsers(users.map(user => (user.email === userId ? { ...user, team_id: teamId } : user)));
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <button onClick={openSummaryView}>Summary View</button>
          <button onClick={openDetailedView}>Detailed View</button>
        </section>

        <section className="search-bar">
          <input
            type="text"
            placeholder="Search by email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </section>

        <section className="users-table">
          {loading ? (
            <p>Loading users...</p>
          ) : (
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
                    <td onClick={() => setSelectedUser(user)}>{user.user_id}</td>
                    <td onClick={() => setSelectedUser(user)}>{user.email}</td>
                    <td>{teams.find(team => team.team_id === user.team_id)?.team_id || 'Unassigned'}</td>
                    <td>
                      <select
                        value={user.team_id || ''}
                        onChange={(e) => handleAssignTeam(user.email, e.target.value)}
                      >
                        <option value="">Select Team</option>
                        {teams.map(team => (
                          <option key={team.team_id} value={team.team_id}>{team.team_id}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {isAddTeamModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Create New Team</h3>
              <input
                type="text"
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <button onClick={handleCreateTeam} className="confirm-btn">Create Team</button>
              <button onClick={() => setIsAddTeamModalOpen(false)} className="close-btn">Cancel</button>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="user-details-modal">
            <h3>User Details</h3>
            <p><strong>User ID:</strong> {selectedUser.user_id}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Team ID:</strong> {selectedUser.team_id}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <button onClick={() => setSelectedUser(null)} className="close-btn">Close</button>
          </div>
        )}

        {isSummaryViewOpen && (
          <SummaryViewModal onClose={closeSummaryView} />
        )}

        {isDetailedViewOpen && (
          <DetailedViewModal onClose={closeDetailedView} />
        )}
      </div>
    </div>
  );
};

const SummaryViewModal = ({ onClose }) => {
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    const fetchSummaryData = async () => {
      const { data, error } = await supabase
        .from('Assessments')
        .select('Accessed_Email, Ratings')
        .not('Ratings', 'is', null); // Fetch only records with ratings

      if (error) {
        console.error("Error fetching summary data:", error);
      } else {
        // Calculate averages for each student
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
    };

    fetchSummaryData();
  }, []);

  return (
    <div className="modal">
    <div className="modal-content summary-view">
      <h2>Summary of Results View</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Memeber id</th>
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
      <button onClick={onClose}>Close</button>
    </div>
    </div>
  );
};
const DetailedViewModal = ({ onClose }) => {
  const [detailedData, setDetailedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailedData = async () => {
      const { data, error } = await supabase
        .from('Assessments')
        .select('Accessed_email, Accessor_Email, Ratings, Comments');

      if (error) {
        console.error("Error fetching detailed data:", error);
      } else {
        console.log("Fetched data:", data); // Log the fetched data to verify it

        if (data && data.length > 0) {
          // Group data by Accessed_email (each student's assessment)
          const groupedData = data.reduce((acc, assessment) => {
            const { Accessed_email } = assessment;
            if (!acc[Accessed_email]) acc[Accessed_email] = [];
            
            // Calculate the average for each row of ratings
            const { cooperation = 0, conceptualContribution = 0, practicalContribution = 0, workEthic = 0 } = assessment.Ratings || {};
            const average = (
              (cooperation + conceptualContribution + practicalContribution + workEthic) / 4
            ).toFixed(2);

            acc[Accessed_email].push({
              ...assessment,
              average,
            });

            return acc;
          }, {});

          setDetailedData(groupedData);
        } else {
          console.warn("No data found in the 'Assessments' table.");
        }
      }
      setLoading(false);
    };

    fetchDetailedData();
  }, []);

  if (loading) {
    return <p>Loading data...</p>;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Detailed View</h3>
        <p><strong>Team Name:</strong> 12</p>

        {Object.keys(detailedData).length === 0 ? (
          <p>No data available.</p>
        ) : (
          Object.keys(detailedData).map((accessedEmail, tableIndex) => (
            <div key={tableIndex}>
              <p><strong>Student Name:</strong> {accessedEmail}</p>

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
                  {detailedData[accessedEmail].map((student, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{student.Accessor_Email}</td>
                      <td>{student.Ratings.cooperation}</td>
                      <td>{student.Ratings.conceptualContribution}</td>
                      <td>{student.Ratings.practicalContribution}</td>
                      <td>{student.Ratings.workEthic}</td>
                      <td>{student.average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>Comments:</h4>
              {detailedData[accessedEmail].map((student, commentIndex) => (
                <p key={commentIndex}>
                  <strong>{student.Accessor_Email} comment:</strong> {student.Comments.cooperation || "No comments"}
                </p>
              ))}
              <p>...</p> {/* Add more hardcoded comments if needed */}
            </div>
          ))
        )}
        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
};




export default InstructorDashboard;
