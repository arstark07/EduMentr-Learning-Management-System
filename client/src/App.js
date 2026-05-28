import React from "react";
import Profile from "./pages/Profile";
import MyCourses from "./pages/MyCourses";
import CourseDetails from "./pages/CourseDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";

function App() {

  return (

    <BrowserRouter>

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route
         path="/profile"
         element={<Profile />}
        />
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<ProtectedRoute>
                  <Dashboard />
                  </ProtectedRoute>
                  }
        />
        <Route
          path="/course/:id"
          element={
                    <ProtectedRoute>
                    <CourseDetails />
                    </ProtectedRoute>
                  }
        />
        <Route
          path="/my-courses"
          element={
                    <ProtectedRoute>
                    <MyCourses />
                    </ProtectedRoute>
                  }
          />

      </Routes>

    </BrowserRouter>
  );
}

export default App;