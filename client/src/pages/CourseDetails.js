import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import Navbar from "../components/Navbar";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeTab, setActiveTab] = useState("Syllabus");

  // Review Submissions State
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Q&A Discussion State
  const [questionText, setQuestionText] = useState("");
  const [replyInputs, setReplyInputs] = useState({}); // maps questionId -> replyText

  const [videoData, setVideoData] = useState({
    title: "",
    videoUrl: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchCourseDetails();
    fetchReviews();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(response.data);
      
      // Auto-set the first video as active if none is set
      if (response.data.videos?.length > 0 && !activeVideo) {
        setActiveVideo(response.data.videos[0]);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to load course details");
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.log("Error loading reviews:", error);
    }
  };

  const handleVideoChange = (e) => {
    setVideoData({
      ...videoData,
      [e.target.name]: e.target.value,
    });
  };

  const addVideo = async (e) => {
    e.preventDefault();
    if (!videoData.title || !videoData.videoUrl) {
      return toast.warning("Please fill out both video fields");
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/courses/video/${id}`, videoData, {
        headers: {
          Authorization: token,
        },
      });

      toast.success("New Lecture added to syllabus!");
      setVideoData({ title: "", videoUrl: "" });
      fetchCourseDetails();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add video");
    }
  };

  const watchVideo = async (videoId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/courses/watch/${id}/${videoId}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success(response.data.message);
      fetchCourseDetails();
    } catch (error) {
      console.log(error);
      toast.error("Failed to mark video as watched");
    }
  };

  const deleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`http://localhost:5000/api/courses/video/${id}/${videoId}`, {
        headers: {
          Authorization: token,
        },
      });

      toast.success(response.data.message);
      // If we deleted the currently active video, reset active video
      if (activeVideo?._id === videoId) {
        setActiveVideo(null);
      }
      fetchCourseDetails();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete video");
    }
  };

  const deleteCourse = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to delete this entire course? This action is irreversible.")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`http://localhost:5000/api/courses/${id}`, {
        headers: {
          Authorization: token,
        },
      });

      toast.success(response.data.message);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete course");
    }
  };

  const enrollCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/courses/enroll/${id}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success(response.data.message);
      fetchCourseDetails();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Enrollment Failed");
    }
  };

  const unenrollCourse = async () => {
    if (!window.confirm("Are you sure you want to withdraw from this course? Your progress will be lost.")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/courses/unenroll/${id}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success(response.data.message);
      fetchCourseDetails();
    } catch (error) {
      console.log(error);
      toast.error("Unenroll failed");
    }
  };

  // Star review submit handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/courses/${id}/reviews`,
        { rating: ratingInput, comment: reviewComment },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success("Thank you for your rating!");
      setReviewComment("");
      fetchReviews();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  // Q&A Question submit handler
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return toast.warning("Please type a question");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/courses/${id}/questions`,
        { text: questionText },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success(response.data.message);
      setQuestionText("");
      fetchCourseDetails();
    } catch (error) {
      console.log(error);
      toast.error("Failed to post question");
    }
  };

  // Q&A Reply submit handler
  const handleReplySubmit = async (e, questionId) => {
    e.preventDefault();
    const replyText = replyInputs[questionId];
    if (!replyText || !replyText.trim()) return toast.warning("Please type a reply");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/courses/${id}/questions/${questionId}/reply`,
        { text: replyText },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success(response.data.message);
      setReplyInputs({
        ...replyInputs,
        [questionId]: "",
      });
      fetchCourseDetails();
    } catch (error) {
      console.log(error);
      toast.error("Failed to post reply");
    }
  };

  const handleReplyChange = (questionId, text) => {
    setReplyInputs({
      ...replyInputs,
      [questionId]: text,
    });
  };

  const calculateProgress = () => {
    if (!course?.videos?.length) {
      return 0;
    }

    const watchedVideos = course.videos.filter((video) =>
      video.watchedBy?.includes(user?._id)
    ).length;

    return Math.round((watchedVideos / course.videos.length) * 100);
  };

  const isEnrolled = course?.enrolledStudents?.includes(user?._id);
  const isInstructor = course?.instructor?._id === user?._id;
  const hasAccess = isInstructor || isEnrolled;
  const progressPercent = calculateProgress();

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-700">Loading course curriculum...</h2>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "No ratings yet";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <img
                src={course.thumbnail}
                alt="thumbnail"
                className="w-48 h-32 rounded-2xl object-cover shadow-md"
              />
              <div>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                  {course.category}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none mb-2">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                  <span className="font-semibold text-slate-600">👨‍🏫 Instructor: {course.instructor?.name}</span>
                  <span>•</span>
                  <span>👥 Roster: {course.enrolledStudents?.length} Enrolled</span>
                  <span>•</span>
                  <span className="text-yellow-600 font-bold">⭐ {avgRating} ({reviews.length} Ratings)</span>
                </div>
              </div>
            </div>

            {/* Header Enrollment Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              {user?.role === "student" && (
                isEnrolled ? (
                  <button
                    onClick={unenrollCourse}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold transition text-center"
                  >
                    Withdraw Course
                  </button>
                ) : (
                  <button
                    onClick={enrollCourse}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition text-center"
                  >
                    Enroll Now
                  </button>
                )
              )}
              {isInstructor && (
                <button
                  onClick={deleteCourse}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition text-center"
                >
                  Delete Course 🗑️
                </button>
              )}
            </div>
          </div>

          {/* Core Workplace Split UI (Playlist Sidebar & Player) */}
          {hasAccess ? (
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column: Player & Active Workspace Tabs */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Video Canvas Player */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100">
                  {activeVideo ? (
                    <div>
                      <div className="relative aspect-video w-full bg-slate-950">
                        <iframe
                          width="100%"
                          height="100%"
                          src={activeVideo.videoUrl.replace("watch?v=", "embed/")}
                          title={activeVideo.title}
                          frameBorder="0"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        ></iframe>
                      </div>
                      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-400">Currently Playing</span>
                          <h2 className="text-xl font-bold text-slate-800">{activeVideo.title}</h2>
                        </div>
                        {user?.role === "student" && (
                          <button
                            onClick={() => watchVideo(activeVideo._id)}
                            className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                              activeVideo.watchedBy?.includes(user?._id)
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            }`}
                          >
                            {activeVideo.watchedBy?.includes(user?._id) ? "✓ Completed Lesson" : "Mark as Finished"}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
                      <span className="text-5xl mb-4">📺</span>
                      <h3 className="text-xl font-bold mb-1">No active lecture selected</h3>
                      <p className="text-slate-400 text-sm max-w-xs">
                        Select a lesson from the course syllabus sidebar on the right to start your learning panel.
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation Tabs Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-2 overflow-x-auto">
                  {["Syllabus", "Overview", "Q&A Discussion", "Reviews & Star Ratings"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
                        activeTab === tab
                          ? "bg-slate-100 text-slate-800 shadow-inner"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                  {user?.role === "student" && progressPercent === 100 && (
                    <button
                      onClick={() => setActiveTab("Certificate")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition shrink-0 ${
                        activeTab === "Certificate"
                          ? "bg-amber-100 text-amber-800 shadow-md"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm border border-amber-200"
                      }`}
                    >
                      🎓 Graduation Certificate
                    </button>
                  )}
                </div>

                {/* Tabs Panel Area */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-[300px]">
                  
                  {/* TAB 1: Syllabus Panel */}
                  {activeTab === "Syllabus" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <h3 className="text-2xl font-extrabold text-slate-800">Course Syllabus Lectures</h3>
                        <span className="text-sm font-semibold text-slate-500">{course.videos?.length || 0} Total Videos</span>
                      </div>
                      
                      {/* Instructor add lecture module */}
                      {isInstructor && (
                        <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl mb-8">
                          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <span>➕</span> Add a New Lecture to Syllabus
                          </h4>
                          <form onSubmit={addVideo} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                name="title"
                                placeholder="Lecture Title (e.g. Setting up Environment)"
                                value={videoData.title}
                                onChange={handleVideoChange}
                                className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
                              />
                              <input
                                type="text"
                                name="videoUrl"
                                placeholder="YouTube Video URL (watch?v=...)"
                                value={videoData.videoUrl}
                                onChange={handleVideoChange}
                                className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
                              />
                            </div>
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                            >
                              Add Lecture
                            </button>
                          </form>
                        </div>
                      )}

                      {course.videos?.length === 0 ? (
                        <p className="text-slate-500 py-10 text-center text-sm">No lecture videos have been added to this syllabus yet.</p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {course.videos.map((vid, idx) => (
                            <div
                              key={vid._id}
                              onClick={() => setActiveVideo(vid)}
                              className={`py-4 flex items-center justify-between cursor-pointer group transition-colors px-3 rounded-xl ${
                                activeVideo?._id === vid._id ? "bg-slate-50" : "hover:bg-slate-50/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 font-bold w-6">{idx + 1}.</span>
                                <h4 className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors text-sm md:text-base">
                                  {vid.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-3">
                                {vid.watchedBy?.includes(user?._id) && (
                                  <span className="text-emerald-500 text-sm font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">✓ Watched</span>
                                )}
                                {isInstructor && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteVideo(vid._id);
                                    }}
                                    className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Overview Description */}
                  {activeTab === "Overview" && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-extrabold text-slate-800 border-b border-slate-100 pb-4">Syllabus Overview</h3>
                      <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">{course.description}</p>
                      
                      <div className="border-t border-slate-100 pt-6">
                        <h4 className="font-bold text-slate-800 mb-3 text-lg">Course Instructor Information</h4>
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl max-w-md">
                          <img
                            src={course.instructor?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                            alt="inst"
                            className="w-14 h-14 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h5 className="font-bold text-slate-800 text-base">{course.instructor?.name}</h5>
                            <p className="text-slate-500 text-xs">{course.instructor?.email}</p>
                            <span className="text-xs text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded mt-1 inline-block">Professional Educator</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Q&A Discussion Board */}
                  {activeTab === "Q&A Discussion" && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-extrabold text-slate-800 border-b border-slate-100 pb-4">Q&A Discussion Board</h3>
                      
                      {/* Post Question Form */}
                      <form onSubmit={handleQuestionSubmit} className="space-y-3">
                        <textarea
                          placeholder="Ask a technical question about the current lessons or assignments..."
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          className="w-full border border-slate-200 p-4 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 resize-none h-24"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                        >
                          Post Question
                        </button>
                      </form>

                      {/* Display Question Threads */}
                      <div className="space-y-6 mt-8">
                        {!course.questions || course.questions.length === 0 ? (
                          <p className="text-slate-500 text-center py-6 text-sm">No discussions started yet. Ask the first question!</p>
                        ) : (
                          course.questions.map((q) => (
                            <div key={q._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/55 space-y-4">
                              
                              {/* Parent Question */}
                              <div className="flex items-start gap-3">
                                <img
                                  src={q.user?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                  alt="pic"
                                  className="w-9 h-9 rounded-full object-cover border"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 text-sm">{q.user?.name}</span>
                                    <span className="text-slate-400 text-xxs">{new Date(q.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-slate-700 text-sm mt-1">{q.text}</p>
                                </div>
                              </div>

                              {/* Nested Replies */}
                              {q.replies && q.replies.length > 0 && (
                                <div className="ml-8 pl-4 border-l border-slate-200 space-y-4">
                                  {q.replies.map((reply) => (
                                    <div key={reply._id} className="flex items-start gap-2.5">
                                      <img
                                        src={reply.user?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                        alt="pic"
                                        className="w-7 h-7 rounded-full object-cover border"
                                      />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-800 text-xs">{reply.user?.name}</span>
                                          <span className="text-slate-400 text-xxs">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-600 text-xs mt-0.5">{reply.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Write Reply Box */}
                              <form
                                onSubmit={(e) => handleReplySubmit(e, q._id)}
                                className="ml-8 flex gap-2 items-center"
                              >
                                <input
                                  type="text"
                                  placeholder="Reply to this thread..."
                                  value={replyInputs[q._id] || ""}
                                  onChange={(e) => handleReplyChange(q._id, e.target.value)}
                                  className="flex-grow border border-slate-200 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-50"
                                />
                                <button
                                  type="submit"
                                  className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                                >
                                  Reply
                                </button>
                              </form>

                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Reviews & Ratings */}
                  {activeTab === "Reviews & Star Ratings" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <h3 className="text-2xl font-extrabold text-slate-800">Ratings & Reviews</h3>
                        <span className="text-base font-bold text-slate-500">⭐ {avgRating} Average</span>
                      </div>

                      {/* Write Review Form */}
                      {user?.role === "student" && isEnrolled && (
                        <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl space-y-4">
                          <h4 className="font-bold text-slate-700 text-sm">Submit your Course Review</h4>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600 text-xs font-semibold">Select Rating:</span>
                            <select
                              value={ratingInput}
                              onChange={(e) => setRatingInput(e.target.value)}
                              className="border border-slate-200 p-2 rounded-lg text-sm bg-white"
                            >
                              <option value="5">⭐⭐⭐⭐⭐ (5 - Perfect)</option>
                              <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                              <option value="3">⭐⭐⭐ (3 - Average)</option>
                              <option value="2">⭐⭐ (2 - Poor)</option>
                              <option value="1">⭐ (1 - Terrible)</option>
                            </select>
                          </div>

                          <textarea
                            placeholder="Share your learning experience, what you liked, and areas for improvement..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full border border-slate-200 p-4 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 resize-none h-20"
                          />

                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                          >
                            Submit Feedback
                          </button>
                        </form>
                      )}

                      {/* Reviews List */}
                      <div className="space-y-4 mt-6">
                        {reviews.length === 0 ? (
                          <p className="text-slate-500 text-center py-6 text-sm">No reviews posted yet. Be the first to leave a review!</p>
                        ) : (
                          reviews.map((r) => (
                            <div key={r._id} className="border-b border-slate-100 pb-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={r.user?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                    alt="pic"
                                    className="w-8 h-8 rounded-full object-cover border"
                                  />
                                  <span className="font-bold text-slate-800 text-sm">{r.user?.name}</span>
                                </div>
                                <span className="text-yellow-500 font-bold text-sm">
                                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                                </span>
                              </div>
                              <p className="text-slate-600 text-xs pl-10">{r.comment || "Rated without comments."}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: Elegant Certificate of Completion */}
                  {activeTab === "Certificate" && user?.role === "student" && progressPercent === 100 && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                        <h3 className="text-2xl font-extrabold text-slate-800">Graduation Center</h3>
                        <button
                          onClick={() => window.print()}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition"
                        >
                          Print Certificate 🖨️
                        </button>
                      </div>

                      {/* PDF printable beautiful certificate frame */}
                      <div className="bg-amber-50/20 border-8 border-amber-800/80 p-8 md:p-12 rounded-3xl relative text-center shadow-lg border-double" id="certificate-print-area">
                        <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-amber-800/60 pointer-events-none"></div>
                        <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-amber-800/60 pointer-events-none"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-amber-800/60 pointer-events-none"></div>
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-amber-800/60 pointer-events-none"></div>

                        <span className="text-amber-800/80 font-serif text-lg tracking-widest uppercase block mb-4">Certificate of Completion</span>
                        
                        <span className="text-slate-400 font-sans text-xs tracking-wider block mb-2">THIS IS PROUDLY PRESENTED TO</span>
                        
                        <h2 className="text-4xl md:text-5xl font-serif text-slate-900 font-extrabold italic uppercase tracking-wider mb-6 border-b-2 border-slate-200 max-w-xl mx-auto pb-4">
                          {user?.name}
                        </h2>

                        <p className="text-slate-600 font-serif text-sm max-w-lg mx-auto leading-relaxed mb-8">
                          for successfully qualifying and completing all visual curriculum specifications and course lecture requirements for the premium syllabus:
                        </p>

                        <h3 className="text-2xl md:text-3xl font-sans font-bold text-indigo-900 mb-10">
                          {course.title}
                        </h3>

                        {/* Certificate Signatures */}
                        <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto pt-4 border-t border-slate-200/80">
                          <div>
                            <span className="font-serif italic text-slate-800 text-base border-b border-slate-350 block max-w-[150px] mx-auto pb-1">
                              {course.instructor?.name}
                            </span>
                            <span className="text-slate-400 font-sans text-xxs tracking-wider uppercase block mt-2">Course Instructor</span>
                          </div>
                          <div>
                            <span className="font-serif text-amber-800 text-sm font-bold border-b border-slate-350 block max-w-[150px] mx-auto pb-2">
                              🛡️ EDUMENTR ACADEMY
                            </span>
                            <span className="text-slate-400 font-sans text-xxs tracking-wider uppercase block mt-2">Verified Platform License</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Right Column: Interactive Course Playlist Sidebar */}
              <div className="space-y-6">
                
                {/* Unified Progress Card */}
                {user?.role === "student" && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-lg">Your Lecture Progress</h3>
                    
                    {/* Completion bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-indigo-600">{progressPercent}% Completed</span>
                        <span className="text-slate-500">
                          {course.videos?.filter(v => v.watchedBy?.includes(user?._id)).length || 0} / {course.videos?.length || 0} Lessons
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Playlist Sidebar */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
                    <h3 className="font-extrabold text-base">Course Content</h3>
                    <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold">{course.videos?.length || 0} lectures</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {course.videos?.length === 0 ? (
                      <p className="p-6 text-center text-xs text-slate-500">Syllabus is currently empty.</p>
                    ) : (
                      course.videos.map((vid, idx) => (
                        <div
                          key={vid._id}
                          onClick={() => setActiveVideo(vid)}
                          className={`p-4 cursor-pointer flex gap-3 transition-colors ${
                            activeVideo?._id === vid._id
                              ? "bg-indigo-50/50 border-l-4 border-indigo-600"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="shrink-0 flex items-center justify-center">
                            {vid.watchedBy?.includes(user?._id) ? (
                              <span className="text-emerald-500 text-base font-bold bg-emerald-50 w-7 h-7 rounded-full flex items-center justify-center border border-emerald-100">✓</span>
                            ) : (
                              <span className="text-slate-400 text-xs font-bold border border-slate-200 w-7 h-7 rounded-full flex items-center justify-center bg-slate-50">{idx + 1}</span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h4 className={`text-sm font-semibold leading-tight ${
                              activeVideo?._id === vid._id ? "text-indigo-800 font-bold" : "text-slate-700"
                            }`}>
                              {vid.title}
                            </h4>
                            <span className="text-xxs text-slate-400 block mt-1">Video Lecture • 5m</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Student Catalog View Detail page (Before enrolling/accessing player) */
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column: Core Descriptions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800">What you will learn in this course</h2>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line">{course.description}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Syllabus Overview</h3>
                  {course.videos?.length === 0 ? (
                    <p className="text-slate-500 text-xs">No lectures are registered in this syllabus yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {course.videos.map((vid, idx) => (
                        <div key={vid._id} className="flex gap-3 items-center border border-slate-100 p-3.5 rounded-xl bg-slate-50/60">
                          <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                          <span className="text-slate-700 font-semibold text-sm truncate">{vid.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Enroll card */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 sticky top-6">
                  <img
                    src={course.thumbnail}
                    alt="thumbnail"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 space-y-4">
                    <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">Course Syllabus</span>
                    <h3 className="text-xl font-extrabold text-slate-800">{course.title}</h3>
                    
                    <div className="border-t border-slate-100 pt-4 text-xs space-y-2 text-slate-500">
                      <div>👤 Instructor: <strong className="text-slate-700">{course.instructor?.name}</strong></div>
                      <div>👥 Roster: <strong className="text-slate-700">{course.enrolledStudents?.length} Enrolled</strong></div>
                      <div>📺 Curriculum: <strong className="text-slate-700">{course.videos?.length} Lectures</strong></div>
                    </div>

                    {user?.role === "student" && (
                      <button
                        onClick={enrollCourse}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition text-center block mt-6"
                      >
                        Enroll and Start Learning 🚀
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default CourseDetails;