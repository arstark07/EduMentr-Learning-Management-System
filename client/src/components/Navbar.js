// Import React library
import React from "react";

// Import Link and useNavigate from react-router-dom
import {
  Link,
  useNavigate,
} from "react-router-dom";

// Navbar component
function Navbar() {

  // Hook used for page navigation
  const navigate = useNavigate();

  // Logout function
  const logout = () => {

    // Remove token from localStorage
    localStorage.removeItem("token");

    // Redirect user to login page
    navigate("/login");
  };

  return (

    // Navbar background and text styling
    <div className="bg-blue-600 text-white p-4">

      {/* Container for navbar content */}
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        {/* Logo / Website name */}
        <Link
          to="/dashboard"
          className="text-2xl font-bold"
        >
          LMS
        </Link>

        {/* Navigation links section */}
        <div className="flex gap-4 items-center">

          {/* Dashboard link */}
          <Link to="/dashboard">
            Dashboard
          </Link>

          {/* My Courses link */}
          <Link
            to="/my-courses"
            className="text-white"
          >
            My Courses
          </Link>

          {/* Profile page link */}
          <Link to="/profile">
            Profile
          </Link>

          {/* Logout button */}
          <button
            onClick={logout}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

// Export Navbar component
export default Navbar;