import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SidebarComponent.css";

const SidebarComponent = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="toggle-button"
      >
        {isCollapsed ? "Expand" : "Collapse"}
      </button>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/">
              <span className="icon">🏠</span>
              {!isCollapsed && <span className="text">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link to="/profile">
              <span className="icon">👤</span>
              {!isCollapsed && <span className="text">Profile</span>}
            </Link>
          </li>
          <li>
            <Link to="/team-evaluation"> {/* Link to TeamEvaluation */}
              <span className="icon">👥</span>
              {!isCollapsed && <span className="text">Team Management</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SidebarComponent;


