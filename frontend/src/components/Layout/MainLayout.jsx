// // import React from "react";
// // import { Link, Outlet } from "react-router-dom";
// // import SearchUser from "../SearchUser"; // adjust path if needed
// // import "./MainLayout.css"; // we'll add styles shortly

// // const MainLayout = () => {
// //   return (
// //     <div className="app-layout">
// //       {/* Top Navbar */}
// //       <div className="top-navbar">
// //         <div className="brand">IdeaFlux</div>
// //         <SearchUser />
// //         <div className="profile">👤</div>
// //       </div>

// //       {/* Main content area with sidebar and page content */}
// //       <div className="main-content-area">
// //         <nav className="sidebar">
// //           <Link to="/">🏠 Home</Link>
// //           <Link to="/add-blog">✍️ Add Blog</Link>
// //           <Link to="/notifications">🔔 Notifications</Link>
// //           <Link to="/recommend">🌟 Recommendations</Link>
// //           <Link to="/logout">🚪 Logout</Link>
// //         </nav>

// //         <main className="page-content">
// //           <Outlet />
// //         </main>
// //       </div>
// //     </div>
// //   );
// // };

// // export default MainLayout;
// import React from "react";
// import { Link, Outlet } from "react-router-dom";
// import Navbar from "../Navbar"; // ✅ Import your full working navbar
// import "./MainLayout.css"; // optional for layout styles

// const MainLayout = () => {
//   return (
//     <div>
//       <Navbar /> {/* ✅ This gives you full: Search + Profile + Logout */}

//       <div className="main-content-area">
//         {/* Sidebar */}
//         <nav className="sidebar">
//           <Link to="/">🏠 Home</Link>
//           <Link to="/add-blog">✍️ Add Blog</Link>
//           <Link to="/notifications">🔔 Notifications</Link>
//           {/* <Link to="/dashboard">📂 D</Link> */}
//           <Link to="/recommend">🌟 Recommendations</Link>
//           {/* You can remove the logout link here since it's in Navbar already */}
//         </nav>

//         {/* Page Content */}
//         <main className="page-content" style={{ flex: 1, padding: "1rem" }}>
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default MainLayout;

import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar"; // ✅ Your original navbar with full logic
import "./MainLayout.css";
import SearchUser from "../SearchUser"; // ✅ Import your SearchUser componen
import NotificationsDropdown from "../NotificationDropdown"; // ✅ Import your NotificationsDropdown component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPen,
  faStar,
  faUser,
  faRightFromBracket,
  faRightToBracket,
  faUserPlus,
  faBell,
} from "@fortawesome/free-solid-svg-icons";


const MainLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <div>
      <Navbar />

      <div className="main-content-area" style={{ display: "flex" }}>
        {/* Sidebar */}
        <nav
          className="sidebar"
          
        >
          {isLoggedIn ? (
            <>
              <SearchUser />
              <Link to="/">
                <FontAwesomeIcon icon={faHome} /> Home
              </Link>
              <Link to="/add-blog">
                <FontAwesomeIcon icon={faPen} /> Add Blog
              </Link>
              <Link to="/recommend">
                <FontAwesomeIcon icon={faStar} /> Recommendations
              </Link>
              <Link to="/notifications">
                <FontAwesomeIcon icon={faBell} /> Notifications
              </Link>
              <Link to="/profile">
                <FontAwesomeIcon icon={faUser} /> {user?.name}
              </Link>
              <button onClick={handleLogout}>
                <FontAwesomeIcon icon={faRightFromBracket} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <FontAwesomeIcon icon={faRightToBracket} /> Login
              </Link>
              <Link to="/register">
                <FontAwesomeIcon icon={faUserPlus} /> Register
              </Link>
            </>
          )}

        </nav>

        {/* Main content */}
        <main className="page-content" style={{ flex: 1, padding: "1rem" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

