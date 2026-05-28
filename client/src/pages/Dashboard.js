import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    
    title: "",
    description: "",
    thumbnail: "",
  });
  const user = JSON.parse(
  localStorage.getItem("user")
);

  /* eslint-disable react-hooks/exhaustive-deps */

useEffect(() => {
  fetchCourses();
}, []);

  const fetchCourses = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/courses"
      );

      setCourses(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createCourse = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/courses/create",
        formData,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success("Course Created");

      fetchCourses();

      setFormData({
        title: "",
        description: "",
        thumbnail: "",
      });

    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {

  localStorage.removeItem("token");

  navigate("/login");
};

  return (
  <>
    <Navbar />

    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-6">

      <div className="max-w-7xl mx-auto">

        {/* Hero Section */}
        {/* Hero Section */}
<div className="bg-white/40 backdrop-blur-lg rounded-3xl p-10 shadow-xl flex flex-col md:flex-row items-center justify-between mb-12">

  <div>

    <h1 className="text-4xl font-bold text-gray-900 mb-2">
  Welcome,
  <span className="text-blue-600">
    {" "}{user?.role} 👋
  </span>
</h1>

    <p className="text-2xl text-gray-700">
      Explore and manage your courses
    </p>

  </div>

  <img
    src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
    alt="hero"
    className="w-72 mt-8 md:mt-0"
  />

</div>

        {/* Create Course */}
        {user?.role === "teacher" && (

          <div className="bg-white rounded-3xl shadow-2xl p-10 mb-14">

            <div className="flex items-center gap-4 mb-8">

              <div className="bg-blue-100 p-4 rounded-2xl">

                <span className="text-3xl">
                  ➕
                </span>

              </div>

              <h2 className="text-4xl font-bold text-gray-800">
                Create New Course 🚀
              </h2>

            </div>

            <form onSubmit={createCourse}>

              {/* Title */}
              <input
                type="text"
                name="title"
                placeholder="Course Title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 p-5 rounded-2xl mb-6 text-lg outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Description */}
              <textarea
                name="description"
                placeholder="Course Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 p-5 rounded-2xl mb-6 text-lg h-40 outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Thumbnail */}
              <input
                type="text"
                name="thumbnail"
                placeholder="Thumbnail URL"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full border border-gray-300 p-5 rounded-2xl mb-8 text-lg outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Button */}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl text-xl font-semibold shadow-lg transition"
              >
                ➕ Add Course
              </button>

            </form>

          </div>

        )}

        {/* Courses */}
        <div className="flex items-center gap-4 mb-8">

          <div className="bg-purple-100 p-4 rounded-2xl">

            <span className="text-3xl">
              📖
            </span>

          </div>

          <h2 className="text-4xl font-bold text-gray-800">
            Available Courses
          </h2>

        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

          {courses.map((course) => (

            <Link
              key={course._id}
              to={`/course/${course._id}`}
            >

              <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:scale-105 transition duration-300">

                {/* Thumbnail */}
                <img
                  src={course.thumbnail}
                  alt="course"
                  className="w-full h-60 object-cover"
                />

                {/* Details */}
                <div className="p-6">

                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    {course.title}
                  </h2>

                  <p className="text-gray-600 text-lg mb-6">
                    {course.description}
                  </p>

                  <div className="flex justify-between items-center">

                    <small className="text-gray-500 font-semibold">
                      👨‍🏫 {course.instructor?.name}
                    </small>

                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                      View
                    </span>

                  </div>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </div>

    </div>
  </>
);
}
export default Dashboard;