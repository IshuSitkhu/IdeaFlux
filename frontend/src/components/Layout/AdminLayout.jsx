import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "../AdminNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faPen,
  faHome,
  faRightFromBracket,
  faChevronLeft,
  faChevronRight,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const AdminLayout = () => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!localStorage.getItem("token");

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [totalLikes, setTotalLikes] = useState(0);

  const fetchTotalLikes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/likes", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTotalLikes(res.data.likes?.length || 0);
    } catch (err) {
      console.error("Failed to fetch total likes:", err);
    }
  };

  useEffect(() => {
    fetchTotalLikes();
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(!prev));
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
      <AdminNavbar toggleMobileSidebar={toggleMobileSidebar} />

      <div className="main-content-area">
        {isLoggedIn && admin?.role === "admin" && (
          <>
            {isMobileOpen && (
              <div className="sidebar-backdrop" onClick={toggleMobileSidebar}></div>
            )}

            <nav className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "open" : ""}`}>
              <div className="sidebar-header">
                {!isCollapsed && <span className="menu-text">Menu</span>}
                <button className="toggle-btn" onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
                </button>
              </div>

              <Link className="sidebar-link" to="/admin" onClick={() => setIsMobileOpen(false)}>
                <FontAwesomeIcon icon={faHome} style={iconStyle} />
                {!isCollapsed && <span>Dashboard</span>}
              </Link>

              <Link className="sidebar-link" to="/admin/users" onClick={() => setIsMobileOpen(false)}>
                <FontAwesomeIcon icon={faUsers} style={iconStyle} />
                {!isCollapsed && <span>Users</span>}
              </Link>

              <Link className="sidebar-link" to="/admin/blogs" onClick={() => setIsMobileOpen(false)}>
                <FontAwesomeIcon icon={faPen} style={iconStyle} />
                {!isCollapsed && <span>Blogs</span>}
              </Link>

              <Link className="sidebar-link" to="/admin/categories" onClick={() => setIsMobileOpen(false)}>
                <FontAwesomeIcon icon={faList} style={iconStyle} />
                {!isCollapsed && <span>Categories</span>}
              </Link>

              {/* <Link className="sidebar-link" to="/admin/likes" onClick={() => setIsMobileOpen(false)}>
                <FontAwesomeIcon icon={faList} style={iconStyle} />
                {!isCollapsed && <span>Likes</span>}
                {!isCollapsed && (
                  <span className="ml-auto bg-blue-500 text-white text-sm px-2 py-0.5 rounded-full">
                    {totalLikes}
                  </span>
                )}
              </Link> */}

              <button onClick={handleLogout} className="sidebar-link logout-btn">
                <FontAwesomeIcon icon={faRightFromBracket} style={iconStyle} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </nav>
          </>
        )}

        <main className="page-content">
          {/* Pass refreshLikes as context to child pages */}
          <Outlet context={{ refreshLikes: fetchTotalLikes }} />
        </main>
      </div>

      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #f9fafb;
        }
        .main-content-area {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .sidebar {
          width: 200px;
          flex-shrink: 0;
          background-color: #fff;
          box-shadow: 2px 0 12px rgba(0,0,0,0.08);
          padding: 1rem 0.5rem;
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease, left 0.3s ease;
          height: 100%;
          z-index: 1000;
          border-right: 1px solid #e5e7eb;
        }
        .sidebar.collapsed { width: 55px; }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.6rem;
          margin-bottom: 1rem;
        }
        .menu-text { font-size: 1.2rem; font-weight:bold; color: black; padding-left:15px; padding-bottom:5px; }
        .toggle-btn {
          border: none;
          padding: 0.4rem;
          border-radius: 50%;
          cursor: pointer;
          width: 32px;
          height: 32px;
          background: #2274a1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        /* Sidebar links */
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.8rem;
          text-decoration: none;
          color: black;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .sidebar-link:hover {
          background: #eef2ff;
          color: #2274a1;
        }
        .sidebar.collapsed .sidebar-link span { display: none; }
        .logout-btn { margin-top: auto; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff !important; }
        .logout-btn:hover { background: #b91c1c; }
        .page-content { flex: 1; padding: 1.2rem; overflow-y: auto; }
        @media (max-width: 1024px) {
          .sidebar { position: fixed; top: 70px; left: -240px; width: 220px; height: calc(100% - 70px); box-shadow: 2px 0 16px rgba(0,0,0,0.15); }
          .sidebar.open { left: 0; }
          .toggle-btn { display: none; }
          .sidebar-backdrop { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
