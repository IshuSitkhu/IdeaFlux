import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Not logged in → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch → show 404 or Not Authorized page
  if (role && user?.role !== role) {
    return <Navigate to="/404" replace />; // Create a 404 page or NotAuthorized page
  }

  return children;
};

export default ProtectedRoute;
