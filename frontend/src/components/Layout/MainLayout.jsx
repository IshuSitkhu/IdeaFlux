import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPen,
  faUser,
  faRightFromBracket,
  faMagnifyingGlass,
  faBell,
  faChevronLeft,
  faChevronRight,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";


import SearchUser from "../SearchUser";

const MainLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!localStorage.getItem("token");

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(!prev));
      return !prev;
    });
  };

  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const iconStyle = { minWidth: "20px" };

  return (
    <div className="app-container">
      <Navbar toggleMobileSidebar={toggleMobileSidebar} />

      <div className="main-content-area">
        {isLoggedIn && (
          <>
            {/* Overlay for mobile */}
            {isMobileOpen && (
              <div
                className="sidebar-backdrop"
                onClick={toggleMobileSidebar}
              ></div>
            )}

            {/* Sidebar */}
            <nav
              className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
                isMobileOpen ? "open" : ""
              }`}
            >
              {/* Sidebar Header */}
<div className="sidebar-header">
  {!isCollapsed && <span className="menu-text">Menu</span>}
  <button className="toggle-btn" onClick={toggleSidebar}>
    <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
  </button>
</div>


              {/* Sidebar Links */}
              <NavLink
                className="sidebar-link"
                to="/"
                onClick={() => setIsMobileOpen(false)}
              >
                <FontAwesomeIcon icon={faHome} style={iconStyle} />
                {!isCollapsed && <span>Home</span>}
              </NavLink>

              <NavLink
                className="sidebar-link"
                to="/add-blog"
                onClick={() => setIsMobileOpen(false)}
              >
                <FontAwesomeIcon icon={faPenToSquare} style={iconStyle} />
                {!isCollapsed && <span>Add Blog</span>}
              </NavLink>

              <NavLink
                className="sidebar-link"
                to="/recommend"
                onClick={() => setIsMobileOpen(false)}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} style={iconStyle} />
                {!isCollapsed && <span>Search Blog</span>}
              </NavLink>

              <NavLink
                className="sidebar-link"
                to="/notification-page"
                onClick={() => setIsMobileOpen(false)}
              >
                <FontAwesomeIcon icon={faBell} style={iconStyle} />
                {!isCollapsed && <span>Notifications</span>}
              </NavLink>

              <NavLink
                className="sidebar-link"
                to="/profile"
                onClick={() => setIsMobileOpen(false)}
              >
                <FontAwesomeIcon icon={faUser} style={iconStyle} />
                {!isCollapsed && <span>{user?.name || "Profile"}</span>}
              </NavLink>

              {/* Logout button at bottom */}
              <button onClick={handleLogout} className="sidebar-link logout-btn">
                <FontAwesomeIcon icon={faRightFromBracket} style={iconStyle} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </nav>
          </>
        )}

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Inline styles (you can move to CSS later) */}
     <style>{`
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f9fafb;
    font-family: 'Inter', sans-serif;
  }

  .main-content-area {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  /* Sidebar */
  .sidebar {
    width: 200px;
    flex-shrink: 0;
    background-color: #ffffff;
    box-shadow: 2px 0 12px rgba(0,0,0,0.08);
    padding: 1rem 0.5rem;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease, left 0.3s ease;
    height: calc(100vh - 70px);
    z-index: 1000;
    border-right: 1px solid #e5e7eb;
  }

  .sidebar.collapsed { width: 60px; }

  /* Sidebar Header */
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.8rem;
    margin-bottom: 1.2rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .menu-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  /* Toggle Button */
  .toggle-btn {
    border: none;
    padding: 0.4rem;
    border-radius: 50%;
    cursor: pointer;
    width: 36px;
    height: 36px;
    background: #2274a1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: #1a5f85;
    transform: translateY(-1px);
  }

  /* Sidebar Links */
  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.65rem 1rem;
    text-decoration: none;
    color: #1f2937;
    border-radius: 10px;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 1rem;
  }

  .sidebar-link span {
    transition: opacity 0.2s ease;
  }

  .sidebar-link:hover {
    background: #eef2ff;
    color: #2274a1;
  }

  .sidebar.collapsed .sidebar-link span { display: none; }

  /* Logout Button */
  .logout-btn {
    margin-top: auto;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #ffffff !important;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  .logout-btn:hover {
    background: #b91c1c;
  }

  /* Page Content */
  .page-content {
    flex: 1;
    padding: 1.5rem 1.2rem;
    overflow-y: auto;
    font-size: 1rem;
    color: #374151;
  }

  /* Mobile Sidebar */
  @media (max-width: 1024px) {
    .sidebar {
      position: fixed;
      top: 70px;
      left: -240px;
      width: 220px;
      height: calc(100% - 70px);
      box-shadow: 2px 0 16px rgba(0,0,0,0.15);
    }
    .sidebar.open { left: 0; }
    .toggle-btn { display: none; }

    .sidebar-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 999;
    }
  }
`}</style>

    </div>
  );
};

export default MainLayout;
