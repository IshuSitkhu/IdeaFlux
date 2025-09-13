import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./MainLayout.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPen,
  faUser,
  faRightFromBracket,
  faRightToBracket,
  faUserPlus,
  faBell,
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

const MainLayout = () => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const iconStyle = { minWidth: "20px" };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(!prev));
      return !prev;
    });
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar />

      <div className="main-content-area">
        {/* Sidebar */}
        <nav className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FontAwesomeIcon
              icon={isCollapsed ? faChevronRight : faChevronLeft}
            />
          </button>

          {isLoggedIn ? (
            <>
              <NavLink className="sidebar-link" to="/">
                <FontAwesomeIcon icon={faHome} style={iconStyle} />
                {!isCollapsed && <span>Home</span>}
              </NavLink>

              <NavLink className="sidebar-link" to="/add-blog">
                <FontAwesomeIcon icon={faPen} style={iconStyle} />
                {!isCollapsed && <span>Add Blog</span>}
              </NavLink>

              <NavLink className="sidebar-link" to="/recommend">
                <FontAwesomeIcon icon={faMagnifyingGlass} style={iconStyle} />
                {!isCollapsed && <span>Search Blog</span>}
              </NavLink>

              <NavLink className="sidebar-link" to="/notification-page">
                <FontAwesomeIcon icon={faBell} style={iconStyle} />
                {!isCollapsed && <span>Notifications</span>}
              </NavLink>

              <NavLink className="sidebar-link" to="/profile">
                <FontAwesomeIcon icon={faUser} style={iconStyle} />
                {!isCollapsed && <span>{user?.name || "Profile"}</span>}
              </NavLink>

              <button onClick={handleLogout} className="sidebar-link logout-btn">
                <FontAwesomeIcon icon={faRightFromBracket} style={iconStyle} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </>
          ) : (
            <>
              <NavLink className="sidebar-link" to="/login">
                <FontAwesomeIcon icon={faRightToBracket} style={iconStyle} />
                {!isCollapsed && <span>Login</span>}
              </NavLink>

              <NavLink className="sidebar-link" to="/register">
                <FontAwesomeIcon icon={faUserPlus} style={iconStyle} />
                {!isCollapsed && <span>Register</span>}
              </NavLink>
            </>
          )}
        </nav>

        {/* Main Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
