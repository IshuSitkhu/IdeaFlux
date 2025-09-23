import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import NotificationsDropdown from "./NotificationDropdown";
import SearchUser from "./SearchUser";
import "./Navbar.css";

const Navbar = ({ toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
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

          <Link to="/" className="navbar-brand">
            <img src="/favicon.ico" alt="Logo" className="navbar-logo" />
            IdeaFlux
          </Link>

          {/* Desktop search bar */}
          
        </div>
        {!isMobile && isLoggedIn && <SearchUser />}

        {/* Desktop right links */}
        {!isMobile && (
          <div className="navbar-links">
            {isLoggedIn ? (
              <>
                <NotificationsDropdown />
                <div
                  onClick={() => navigate("/profile")}
                  className="navbar-profile"
                  title={`Logged in as ${user?.name}`}
                >
                  {user?.name?.charAt(0) || "U"}
                </div>
                <button className="navbar-logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="navbar-link" to="/login">
                  Login
                </Link>
                <Link className="navbar-link" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Mobile search bar (full width under navbar) */}
      {isMobile && isLoggedIn && (
        <div className="navbar-mobile-search">
          <SearchUser isMobileMenuOpen={true} />
        </div>
      )}
    </>
  );
};

export default Navbar;
