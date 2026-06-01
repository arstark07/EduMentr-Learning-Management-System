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

    // Navbar background and text styling with Udemy dark-slate theme
    <div className="bg-slate-900 border-b border-slate-850 text-white py-4 px-6 md:px-8 shadow-md">

      {/* Container for navbar content */}
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo / Website name */}
        <Link
          to="/dashboard"
          className="text-2xl font-black tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition"
        >
          <span className="text-indigo-500">🎓</span> Edumentr
        </Link>

        {/* Navigation links section */}
        <div className="flex gap-6 items-center text-sm font-semibold">

          {/* Dashboard link */}
          <Link to="/dashboard" className="text-slate-200 hover:text-indigo-400 transition">
            Discovery Catalog
          </Link>

          {/* My Courses link */}
          <Link
            to="/my-courses"
            className="text-slate-200 hover:text-indigo-400 transition"
          >
            My Courses
          </Link>

          {/* Profile page link */}
          <Link to="/profile" className="text-slate-200 hover:text-indigo-400 transition">
            Profile
          </Link>

          {/* Logout button */}
          <button
            onClick={logout}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-900/20 text-xs"
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