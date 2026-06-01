import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    category: "Development",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/courses/my/enrolled",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setCourses(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (course) => {
    setSelectedCourse(course);
    setEditFormData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || "",
      category: course.category || "Development",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCourse(null);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.description || !editFormData.thumbnail) {
      return toast.warning("Please fill out all fields");
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/courses/${selectedCourse._id}`,
        editFormData,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success("Course details updated successfully!");
      handleCloseEditModal();
      fetchMyCourses(); // Refresh courses list
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update course");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10 text-white">
              <span className="bg-indigo-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 inline-block border border-indigo-500/30">
                Personal Classroom
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                {user?.role === "teacher" ? "My Instructed Courses" : "My Enrolled Courses"}
              </h1>
              <p className="text-slate-300 text-sm md:text-base font-medium max-w-xl">
                {user?.role === "teacher"
                  ? "Manage and edit details of courses you instruct, or enter classroom to configure syllabus and videos."
                  : "Track your progression status, check question discussions and keep learning from your catalog."}
              </p>
            </div>
            <div className="relative z-10 flex gap-2 mt-6 md:mt-0">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
                <span className="block text-2xl font-black text-white">{courses.length}</span>
                <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Total Courses</span>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-4 text-slate-500 font-semibold text-sm">Fetching your courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-10 shadow-sm max-w-2xl mx-auto">
              <span className="text-5xl block mb-4">📚</span>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">
                {user?.role === "teacher" ? "No Instructed Courses Yet" : "Not Enrolled in Any Courses"}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                {user?.role === "teacher"
                  ? "Launch your first learning course syllabus today on your main discovery catalog."
                  : "Explore the discovery catalog and enroll in one of our professional classes to get started."}
              </p>
              <Link
                to="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-md inline-block"
              >
                Go to Discovery Catalog
              </Link>
            </div>
          ) : (
            /* Courses Grid */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col group"
                >
                  {/* Thumbnail Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}
                      alt="course"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-indigo-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {course.category}
                    </span>
                  </div>

                  {/* Course Details Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-50">
                      {/* Instructor Meta */}
                      <div className="flex items-center gap-2 mb-5">
                        <img
                          src={course.instructor?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                          alt="instructor"
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="text-xs text-slate-500 font-semibold truncate">
                          Instructor: {course.instructor?.name || "Unknown"}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Link
                          to={`/course/${course._id}`}
                          className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs text-center transition shadow-md shadow-indigo-100"
                        >
                          {user?.role === "teacher" ? "Manage Syllabus" : "Enter Classroom"}
                        </Link>
                        {user?.role === "teacher" && (
                          <button
                            onClick={() => handleOpenEditModal(course)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-amber-200/50"
                          >
                            Edit Info
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Elegant Edit Course Modal Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Edit Course Details</h3>
                <p className="text-xs text-slate-500">Modify title, classification, or thumbnail details</p>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-5">
              <div>
                <label className="block text-xs text-slate-600 font-bold mb-1.5 uppercase tracking-wider">Course Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditFormChange}
                  className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  placeholder="e.g. Master React Hooks"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 font-bold mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditFormChange}
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
                    value={editFormData.thumbnail}
                    onChange={handleEditFormChange}
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
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  className="w-full border border-slate-200 p-3.5 rounded-xl text-sm h-32 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
                  placeholder="Provide details about what students will learn..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md shadow-indigo-100"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MyCourses;