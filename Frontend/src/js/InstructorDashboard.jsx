import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { useAuth } from "../components/AuthContext";
import { Navigate } from "react-router-dom";
import supabase from "../components/supabase";
import SidebarComponent from "./SidebarComponent";
import "../css/InstructorDashboard.css";

const InstructorDashboard = () => {
  const { user, role, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [csvData, setCsvData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [usersResponse, teamsResponse, assessmentsResponse] =
          await Promise.all([
            supabase.from("users").select(),
            supabase.from("teams").select(),
            supabase
              .from("Assessments")
              .select("Accessor_Email, Accessed_Email, Ratings, Comments"),
          ]);

        if (
          usersResponse.error ||
          teamsResponse.error ||
          assessmentsResponse.error
        ) {
          console.error(
            "Error fetching data:",
            usersResponse.error ||
              teamsResponse.error ||
              assessmentsResponse.error
          );
          return;
        }
        setUsers(usersResponse.data);
        setTeams(teamsResponse.data);
        setAssessments(assessmentsResponse.data);
      } catch (error) {
        console.error("Error during data fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => setCsvData(results.data),
        error: (error) => console.error("Error parsing CSV:", error),
      });
    }
  };

  const handleImportCsv = async () => {
    if (csvData) {
      const newUsers = csvData.map((row) => ({
        email: row.email,
        team_id: row.team_id,
      }));

      const { error } = await supabase.from("students").upsert(newUsers);
      if (error) {
        console.error("Error importing users:", error);
      } else {
        setUsers([...users, ...newUsers]);
      }
    }
  };
  const getUserAssessments = (userEmail) => {
    return assessments.filter(
      (assessment) => assessment.Accessed_Email === userEmail
    );
  };
  const handleCreateTeam = async () => {
    if (newTeamName) {
      const { error } = await supabase
        .from("teams")
        .upsert([{ team_id: newTeamName }]);
      if (error) {
        console.error("Error creating team:", error);
      } else {
        const { data } = await supabase.from("teams").select("*");
        setTeams(data);
        setNewTeamName("");
        setIsAddTeamModalOpen(false);
      }
    }
  };

  const handleAssignTeam = async (userId, teamId) => {
    const { error } = await supabase
      .from("students")
      .update({ team_id: teamId })
      .eq("email", userId);
    if (error) {
      console.error("Error assigning team:", error);
    } else {
      setUsers(
        users.map((user) =>
          user.email === userId ? { ...user, team_id: teamId } : user
        )
      );
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || role !== "Instructor") {
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard-container">
      <SidebarComponent />
      <div className="instructor-dashboard">
        <header className="dashboard-header">
          <h2>Instructor Dashboard</h2>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </header>

        <section className="profile-card">
          <h3>Instructor Profile</h3>
          <p>
            <strong>Name:</strong> {user.name || "Instructor"}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {role}
          </p>
        </section>

        <section className="actions">
          <input type="file" accept=".csv" onChange={handleCsvUpload} />
          <button onClick={handleImportCsv} disabled={!csvData}>
            Import CSV
          </button>
          <button onClick={() => setIsAddTeamModalOpen(true)}>Add Team</button>
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
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td onClick={() => handleUserClick(user)}>
                      {user.user_id}
                    </td>
                    <td onClick={() => handleUserClick(user)}>{user.email}</td>
                    <td>
                      {teams.find((team) => team.team_id === user.team_id)
                        ?.team_id || "Unassigned"}
                    </td>
                    <td>
                      <select
                        value={user.team_id || ""}
                        onChange={(e) =>
                          handleAssignTeam(user.email, e.target.value)
                        }
                      >
                        <option value="">Select Team</option>
                        {teams.map((team) => (
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
              <button onClick={handleCreateTeam} className="confirm-btn">
                Create Team
              </button>
              <button
                onClick={() => setIsAddTeamModalOpen(false)}
                className="close-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {selectedUser && (
          <div className="user-details-modal">
            <h3>User Details</h3>
            <p>
              <strong>User ID:</strong> {selectedUser.user_id}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Team ID:</strong> {selectedUser.team_id}
            </p>
            <p>
              <strong>Role:</strong> {selectedUser.role}
            </p>
            <div className="assessments-section">
              <h4>Assessments</h4>
              {getUserAssessments(selectedUser.email).length > 0 ? (
                getUserAssessments(selectedUser.email).map(
                  (assessment, index) => (
                    <div
                      key={index}
                      className="assessment-card border p-4 my-2 rounded bg-gray-50"
                    >
                      <p className="font-medium mb-2">
                        Assessment {index + 1} by: {assessment.Accessor_Email}
                      </p>

                      <div className="ratings-section mb-3">
                        <h5 className="font-medium mb-1">Ratings:</h5>
                        <div className="grid grid-cols-2 gap-2">
                          <p>
                            <strong>Cooperation:</strong>{" "}
                            {assessment.Ratings.cooperation}/5
                          </p>
                          <p>
                            <strong>Conceptual:</strong>{" "}
                            {assessment.Ratings.conceptualContribution}/5
                          </p>
                          <p>
                            <strong>Practical:</strong>{" "}
                            {assessment.Ratings.practicalContribution}/5
                          </p>
                          <p>
                            <strong>Work Ethic:</strong>{" "}
                            {assessment.Ratings.workEthic}/5
                          </p>
                        </div>
                      </div>

                      <div className="comments-section">
                        <h5 className="font-medium mb-1">Comments:</h5>
                        <div className="grid gap-2">
                          <p>
                            <strong>Cooperation:</strong>{" "}
                            {assessment.Comments.cooperation || "No comment"}
                          </p>
                          <p>
                            <strong>Conceptual:</strong>{" "}
                            {assessment.Comments.conceptualContribution ||
                              "No comment"}
                          </p>
                          <p>
                            <strong>Practical:</strong>{" "}
                            {assessment.Comments.practicalContribution ||
                              "No comment"}
                          </p>
                          <p>
                            <strong>Work Ethic:</strong>{" "}
                            {assessment.Comments.workEthic || "No comment"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="text-gray-500">
                  No assessments available for this user
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="close-btn mt-4"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;



