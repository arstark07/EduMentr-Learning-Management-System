// Import React library
import React from "react";

// Import Navigate from react-router-dom
import { Navigate } from "react-router-dom";

// ProtectedRoute component
function ProtectedRoute({ children }) {

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If token does not exist,
  // redirect user to login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token exists,
  // allow access to protected page
  return children;
}

// Export component
export default ProtectedRoute;