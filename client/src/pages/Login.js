import React, { useState } from "react";

import { toast } from "react-toastify";
import axios from "axios";
import {
  useNavigate,
  Link,
} from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      toast.success(response.data.message);

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      toast.error(
  error.response?.data?.message ||
  "Login Failed"
);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-4">

    <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md">

      {/* Heading */}
      <h1 className="text-4xl font-bold text-white text-center mb-2">
        Welcome Back 👋
      </h1>

      <p className="text-white/80 text-center mb-8">
        Login to continue your learning
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit}>

        {/* Email */}
        <div className="mb-5">

          <label className="text-white block mb-2">
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-white/30 text-white placeholder-white outline-none border border-white/20 focus:border-white"
          />

        </div>

        {/* Password */}
        <div className="mb-6">

          <label className="text-white block mb-2">
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-white/30 text-white placeholder-white outline-none border border-white/20 focus:border-white"
          />

        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-white text-purple-700 font-bold py-3 rounded-xl hover:scale-105 transition duration-300"
        >
          Login
        </button>

      </form>

      {/* Signup Link */}
      <p className="text-center text-white mt-6">

        Don’t have an account?

        {" "}

        <Link
          to="/signup"
          className="font-bold underline"
        >
          Signup
        </Link>

      </p>

    </div>

  </div>
);
}

export default Login;