import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/Layout/MainLayout"; 
import AdminLayout from "./components/Layout/AdminLayout"; 

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
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgetPassword.jsx";
import VerifyOTP from "./pages/VerifyOTP.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";



import AdminUsers from "./pages/AdminUsers";
import AdminBlogs from "./pages/AdminBlogs";
import AdminPage from "./pages/AdminPage";
import AdminUpdate from "./pages/AdminUpdate";
import AdminCategories from "./pages/AdminCategories";
import AdminLikes from "./pages/AdminLikes.jsx";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Import } from "lucide-react";
import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";


//  Admin route protection
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "admin") {
    // not logged in or not admin → show 404
    return <div>Page Not Found</div>;
  }
  return children;
};

function App() {
  useEffect(() => {
    createChat({
      webhookUrl:
        "https://malsha.app.n8n.cloud/webhook/dd3b2486-6cf2-4cfd-989c-27ce565bb0dc/chat",
      initialMessages: [
        "Hi there! 👋",
        "I am IdeaFlux's bot. How can I assist you today?",
      ],
    });
  }, []);
  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />

      <Routes>
        {/* Routes under MainLayout (normal users) */}
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

        {/*  Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminPage />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="likes" element={<AdminLikes />} />
        </Route>

        {/* Admin-specific routes (still protected) */}
        <Route
          path="/admin-update-blog/:id"
          element={
            <AdminRoute>
              <AdminUpdate />
            </AdminRoute>
          }
        />

        {/* Public/auth routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/activate/:token" element={<ActivateAccount />} />

        {/* Fallback route */}
        <Route path="*" element={<div><h1 className="text-7xl font-bold text-red-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Oops! Page not found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you’re looking for doesn’t exist or you don’t have permission to view it.
          </p></div>} />
      </Routes>
    </Router>
  );
}

export default App;