// src/components/Layout/AdminLayout.jsx
import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faPen,
  faHome,
  faRightFromBracket,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "./AdminLayout.css"; // optional, create for styling

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const admin = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(!prev));
      return !prev;
    });
  };

  const iconStyle = { color: "#6366f1", transition: "color 0.3s", minWidth: "20px" };

  return (
    <div className="app-container">
      <Navbar />

      <div className="main-content-area" style={{ display: "flex" }}>
        {/* Sidebar */}
        <nav className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
          </button>

          {isLoggedIn && admin?.role === "admin" && (
            <>
              <Link className="sidebar-link" to="/admin">
                <FontAwesomeIcon icon={faHome} style={iconStyle} />
                {!isCollapsed && <span>Dashboard</span>}
              </Link>
              <Link className="sidebar-link" to="/admin/users">
                <FontAwesomeIcon icon={faUsers} style={iconStyle} />
                {!isCollapsed && <span>Users</span>}
              </Link>
              <Link className="sidebar-link" to="/admin/blogs">
                <FontAwesomeIcon icon={faPen} style={iconStyle} />
                {!isCollapsed && <span>Blogs</span>}
              </Link>

              <button onClick={handleLogout} className="sidebar-link logout-btn">
                <FontAwesomeIcon icon={faRightFromBracket} style={iconStyle} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </>
          )}
        </nav>

        {/* Main content */}
        <main className="page-content" style={{ flex: 1, padding: "20px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
