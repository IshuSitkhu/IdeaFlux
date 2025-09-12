import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./components/Layout/MainLayout"; // layout for normal users
import AdminLayout from "./components/Layout/AdminLayout"; // layout for admin

import Register from "./pages/Register";
import Login from "./pages/Login";
import ActivateAccount from "./pages/ActivateAccount";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AddBlog from "./pages/AddBlog";
import ProfilePage from "./pages/ProfilePage";
import BlogDetail from "./pages/BlogDetail";
import UpdateBlogPage from "./pages/UpdateBlogPage";
import CategoryPage from "./pages/CategoryPage";
import AuthorProfile from "./pages/AuthorProfile";
import RecommendPage from "./pages/RecommendPage";
import RecommendationResult from "./pages/RecommendationResult";
import NotificationDropDown from "./components/NotificationDropdown";
import NotificationsPage from "./pages/NotificationPage";

import AdminUsers from "./pages/AdminUsers";
import AdminBlogs from "./pages/AdminBlogs";
import AdminPage from "./pages/AdminPage";
import AdminUpdate from "./pages/AdminUpdate";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "@fortawesome/fontawesome-svg-core/styles.css";

function App() {
  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />

      <Routes>
        {/* Routes under MainLayout (with sidebar + top navbar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-blog" element={<AddBlog />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/update-blog/:id" element={<UpdateBlogPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/user/:userId" element={<AuthorProfile />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/recommend/:title" element={<RecommendationResult />} />
          <Route path="/notifications" element={<NotificationDropDown />} />
          <Route path="/notification-page" element={<NotificationsPage />} />
        </Route>

        {/* Admin routes under AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPage />} /> {/* default admin page */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="blogs" element={<AdminBlogs />} />
        </Route>

        {/* Existing admin-specific routes */}
        <Route path="/admin-update-blog/:id" element={<AdminUpdate />} />

        {/* Public/auth routes outside layout */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activate/:token" element={<ActivateAccount />} />

        {/* Fallback route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
