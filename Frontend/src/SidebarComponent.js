import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../src/SidebarComponent.css";


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
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/team">Team Management</Link>
          </li>
          <li>
            <Link to="/calendar">Calendar</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SidebarComponent;
