import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [ratings, setRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    category: "Development",
  });
  
  const user = JSON.parse(localStorage.getItem("user"));

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/courses");
      setCourses(response.data);
      fetchRatings(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load courses");
    }
  };

  const fetchRatings = async (loadedCourses) => {
    try {
      const ratingsMap = {};
      await Promise.all(
        loadedCourses.map(async (course) => {
          try {
            const res = await axios.get(`http://localhost:5000/api/courses/${course._id}/reviews`);
            const reviews = res.data;
            if (reviews.length > 0) {
              const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
              ratingsMap[course._id] = {
                average: Math.round((sum / reviews.length) * 10) / 10,
                count: reviews.length,
              };
            } else {
              ratingsMap[course._id] = { average: 0, count: 0 };
            }
          } catch (err) {
            ratingsMap[course._id] = { average: 0, count: 0 };
          }
        })
      );
      setRatings(ratingsMap);
    } catch (err) {
      console.log("Error fetching ratings:", err);
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
    if (!formData.title || !formData.description || !formData.thumbnail) {
      return toast.warning("Please fill out all fields");
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/courses/create", formData, {
        headers: {
          Authorization: token,
        },
      });

      toast.success("New Course Created successfully!");
      fetchCourses();
      setIsCreateModalOpen(false);
      setFormData({
        title: "",
        description: "",
        thumbnail: "",
        category: "Development",
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create course");
    }
  };

  // Filter courses based on Search Term and Selected Category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else if (i - rating < 1 && i - rating > 0) {
        stars.push(<span key={i} className="text-yellow-500">½</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Elegant Hero Banner */}
          <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="relative z-10 text-white max-w-2xl">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider mb-4 inline-block">
                Premium eLearning Ecosystem
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                Welcome back, <span className="text-yellow-300 capitalize">{user?.name}</span> 👋
              </h1>
              <p className="text-lg md:text-xl text-indigo-100 font-medium mb-6">
                {user?.role === "teacher"
                  ? "Manage your curriculum, track classrooms and author new courses inside your customized instructor panel."
                  : "Expand your skill capabilities and track lecture progress on your custom learning dashboards."}
              </p>
              {user?.role === "teacher" && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-yellow-300 hover:bg-yellow-400 text-slate-900 font-bold px-6 py-3.5 rounded-xl text-xs transition transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-yellow-500/20"
                >
                  ➕ Add New Course
                </button>
              )}
            </div>
            <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex justify-center mt-6 md:mt-0">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
                alt="hero"
                className="w-full h-full object-contain filter drop-shadow-2xl animate-pulse"
                style={{ animationDuration: '3s' }}
              />
            </div>
          </div>

          {/* Elegant Add Course Modal Overlay */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Launch a New Course</h3>
                    <p className="text-xs text-slate-500">Design, categorize, and deploy a new learning syllabus</p>
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xl font-bold bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={createCourse} className="space-y-5">
                  <div>
                    <label className="block text-xs text-slate-600 font-bold mb-1.5 uppercase tracking-wider">Course Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                      placeholder="e.g. Master modern React components"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5 uppercase tracking-wider">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-white"
                      >
                        <option value="Development">Development</option>
                        <option value="Business">Business</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5 uppercase tracking-wider">Thumbnail Image URL</label>
                      <input
                        type="text"
                        name="thumbnail"
                        value={formData.thumbnail}
                        onChange={handleChange}
                        className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                        placeholder="https://images.unsplash.com/..."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 font-bold mb-1.5 uppercase tracking-wider">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full border border-slate-200 p-3.5 rounded-xl text-sm h-32 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
                      placeholder="Provide a comprehensive syllabus overview detailing lesson plans..."
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md shadow-indigo-100"
                    >
                      Launch Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search, Discovery & Categories Bar */}
          <div className="mb-10 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-indigo-600">📖</span> Explore Course Catalog
              </h2>
              {/* Premium Search Bar */}
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search course title, syllabus, instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-slate-200 py-3 pl-11 pr-4 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
                <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
              </div>
            </div>

            {/* Premium Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {["All", "Development", "Business", "Design", "Marketing", "Other"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shrink-0 ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Course Discovery Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-150 p-10">
              <span className="text-5xl block mb-4">🏜️</span>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">No Courses Found</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                We couldn't find any courses matching your selection. Try adjusting your search term or select another category filter.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => {
                const ratingInfo = ratings[course._id] || { average: 0, count: 0 };
                return (
                  <Link
                    key={course._id}
                    to={`/course/${course._id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                      {/* Thumbnail Container */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}
                          alt="course"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-indigo-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                          {course.category}
                        </span>
                      </div>

                      {/* Course Content */}
                      <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        {/* Udemy Rating Stars */}
                        <div className="flex items-center gap-1.5 mb-4 mt-auto">
                          {ratingInfo.count > 0 ? (
                            <>
                              <span className="text-yellow-600 text-sm font-bold">{ratingInfo.average}</span>
                              <div className="flex text-xs">{renderStars(ratingInfo.average)}</div>
                              <span className="text-slate-400 text-xs">({ratingInfo.count})</span>
                            </>
                          ) : (
                            <>
                              <span className="text-slate-400 text-xs">No ratings yet</span>
                              <div className="flex text-xs">{renderStars(5)}</div>
                            </>
                          )}
                        </div>

                        {/* Instructor & Action */}
                        <div className="border-t border-slate-50 pt-4 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={course.instructor?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                              alt="instructor"
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <span className="text-slate-600 font-semibold truncate max-w-[120px]">
                              {course.instructor?.name}
                            </span>
                          </div>
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                            View Syllabus
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;