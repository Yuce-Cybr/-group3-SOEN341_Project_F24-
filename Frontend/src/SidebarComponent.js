import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SidebarComponent.css";

const SidebarComponent = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Toggle Arrow Button */}
      <div className="toggle-container">
        <button
          onClick={toggleSidebar}
          className="toggle-button"
        >
          {isCollapsed ? "▶" : "◁"} {/* Right Arrow when collapsed, Left Arrow when expanded */}
        </button>
      </div>

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
            <Link to="/team-evaluation">
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


