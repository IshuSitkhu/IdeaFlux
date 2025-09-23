import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import "./AdminNavbar.css";

const AdminNavbar = ({ toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!localStorage.getItem("token");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          {isMobile && (
            <div className="navbar-hamburger" onClick={toggleMobileSidebar}>
              <FaBars size={22} />
            </div>
          )}

          <Link to="/admin" className="navbar-brand">
            <img src="/favicon.ico" alt="Logo" className="navbar-logo" />
            AdminPanel
          </Link>
        </div>

        {!isMobile && isLoggedIn && (
          <div className="navbar-links">
            <div
              onClick={() => navigate("/admin/profile")}
              className="navbar-profile"
              title={`Logged in as ${admin?.name}`}
            >
              {admin?.name?.charAt(0) || "A"}
            </div>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default AdminNavbar;
