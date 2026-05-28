import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
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
        "http://localhost:5000/api/auth/signup",
        formData
      );

      toast.success(response.data.message);

      navigate("/login");

    } catch (error) {

      console.log(error);

      toast.error(
  error.response?.data?.message ||
  "Login Failed"
);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 px-4">

    <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md">

      {/* Heading */}
      <h1 className="text-4xl font-bold text-white text-center mb-2">
        Create Account 🚀
      </h1>

      <p className="text-white/80 text-center mb-8">
        Join and start your learning journey
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit}>

        {/* Name */}
        <div className="mb-5">

          <label className="text-white block mb-2">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-white/30 text-white placeholder-white outline-none border border-white/20 focus:border-white"
          />

        </div>

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
        <div className="mb-5">

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

        {/* Role */}
        <div className="mb-6">

          <label className="text-white block mb-2">
            Select Role
          </label>

          <select
            name="role"
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-white/30 text-white outline-none border border-white/20 focus:border-white"
          >
            <option
              value="student"
              className="text-black"
            >
              Student
            </option>

            <option
              value="teacher"
              className="text-black"
            >
              Teacher
            </option>

          </select>

        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-white text-pink-600 font-bold py-3 rounded-xl hover:scale-105 transition duration-300"
        >
          Signup
        </button>

      </form>

      {/* Login Link */}
      <p className="text-center text-white mt-6">

        Already have an account?

        {" "}

        <Link
          to="/login"
          className="font-bold underline"
        >
          Login
        </Link>

      </p>

    </div>

  </div>
);
}

export default Signup;