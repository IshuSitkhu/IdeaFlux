import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationsDropdown from "./NotificationDropdown";
import SearchUser from "./SearchUser";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!localStorage.getItem("token");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 412);
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

  const navStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isMobile ? "0.5rem 1rem" : "0.8rem 2rem",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    fontFamily: "Segoe UI, sans-serif",
  };

  const brandStyle = {
    fontSize: isMobile ? "1.5rem" : "2rem",
    fontWeight: "700",
    color: "#4f46e5",
    textDecoration: "none",
    letterSpacing: "1px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const linkContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "0.5rem" : "1rem",
  };

  const profileStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: isMobile ?"36px":"66px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    textTransform: "uppercase",
  };

  const logoutStyle = {
  background: "transparent",
  border: "none",
  color: "#d50707",
  fontWeight: 500,
  fontSize: isMobile ? "0.8rem" : "1rem",
  cursor: "pointer",
  padding: isMobile ? "0.2rem 0.4rem" : "0.3rem 0.6rem",
  transition: "color 0.2s",
};

  return (
    <nav style={navStyle}>
      {/* Brand */}
      <Link to="/" style={brandStyle}>
        <img
          src="/favicon.ico"
          alt="Logo"
          style={{ width: isMobile ? "18px" : "40px", height: isMobile ? "28px" : "40px" }}
        />
        IdeaFlux
      </Link>

      {/* Center: Search */}
      {isLoggedIn && <SearchUser />}

      {/* Right Links / Profile */}
      <div style={linkContainerStyle}>
        {isLoggedIn ? (
          <>
            <NotificationsDropdown />

            <div
              onClick={() => navigate("/profile")}
              style={profileStyle}
              title={`Logged in as ${user?.name}`}
            >
              {user?.name?.charAt(0) || "U"}
            </div>

            <button
              onClick={handleLogout}
              style={logoutStyle}
              onMouseEnter={(e) => (e.target.style.color = "#f25757")}
              onMouseLeave={(e) => (e.target.style.color = "#d50707")}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{ color: "#4f46e5", fontWeight: 500, textDecoration: "none" }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{ color: "#4f46e5", fontWeight: 500, textDecoration: "none" }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
