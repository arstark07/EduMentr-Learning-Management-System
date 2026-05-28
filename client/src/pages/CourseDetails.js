import React, {
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import axios from "axios";

import {
  useParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";

function CourseDetails() {

  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const user = JSON.parse(
  localStorage.getItem("user")
  );
  const [videoData, setVideoData] = useState({
    title: "",
    videoUrl: "",
  });

  useEffect(() => {

    fetchCourse();

  }, []);

  const fetchCourse = async () => {

    try {

      const response = await axios.get(
        `http://localhost:5000/api/courses/${id}`
      );

      setCourse(response.data);

    } catch (error) {

      console.log(error);
      toast.error(
    error.response?.data?.message ||
    "Failed to fetch course"
  );
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

    try {

      const token = localStorage.getItem(
        "token"
      );

      await axios.post(
        `http://localhost:5000/api/courses/video/${id}`,
        videoData,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success("Video Added");

      fetchCourse();

      setVideoData({
        title: "",
        videoUrl: "",
      });

    } catch (error) {

      console.log(error);

      toast.error("Failed to add video");
    }
  };
  const watchVideo = async (videoId) => {

  try {

    const token = localStorage.getItem(
      "token"
    );

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

    fetchCourse();

  } catch (error) {

    console.log(error);

    toast.error("Failed to mark video");
  }
};
const deleteVideo = async (videoId) => {

  try {

    const token = localStorage.getItem(
      "token"
    );

    const response = await axios.delete(
      `http://localhost:5000/api/courses/video/${id}/${videoId}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    toast.success(response.data.message);

    fetchCourse();

  } catch (error) {

    console.log(error);

    toast.error("Failed to delete video");
  }
};
const calculateProgress = () => {

  if (!course?.videos?.length) {
    return 0;
  }

  const watchedVideos =
    course.videos.filter((video) =>
      video.watchedBy?.includes(user._id)
    ).length;

  return Math.round(
    (watchedVideos / course.videos.length) * 100
  );
};
const deleteCourse = async () => {

  try {

    const token = localStorage.getItem(
      "token"
    );

    const response = await axios.delete(
      `http://localhost:5000/api/courses/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    toast.success(response.data.message);

    window.location.href = "/dashboard";

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

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Enrollment Failed"
      );
    }
  };
  const unenrollCourse = async () => {

  try {

    const token = localStorage.getItem(
      "token"
    );

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

    fetchCourse();

  } catch (error) {

    console.log(error);

    toast.error("Unenroll failed");
  }
};

  if (!course) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 p-6">

        <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">

          <img
            src={course.thumbnail}
            alt="course"
            className="w-full h-80 object-cover rounded"
          />

          <h1 className="text-4xl font-bold mt-6">
            {course.title}
          </h1>

          <p className="text-gray-600 mt-4">
            {course.description}
          </p>

          <p className="mt-4">
            <strong>Instructor:</strong>
            {" "}
            {course.instructor?.name}
          </p>
          <p className="mt-2">
            <strong>Students Enrolled:</strong>
            {" "}
            {course.enrolledStudents?.length}
          </p>
         {user?.role === "student" && (

<p className="mt-2">
  <strong>Course Progress:</strong>
  {" "}
  {calculateProgress()}%
</p>

)}
          {user?.role === "teacher" && (
          <div className="mt-8">

            <h2 className="text-2xl font-bold mb-4">
              Add Video
            </h2>

            <form onSubmit={addVideo}>

              <input
                type="text"
                name="title"
                placeholder="Video Title"
                value={videoData.title}
                onChange={handleVideoChange}
                className="w-full border p-3 rounded mb-4"
              />

              <input
                type="text"
                name="videoUrl"
                placeholder="Video URL"
                value={videoData.videoUrl}
                onChange={handleVideoChange}
                className="w-full border p-3 rounded mb-4"
              />

              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded"
              >
                Add Video
              </button>

            </form>

          </div>
          )}
{(
  user?.role === "teacher" ||

  course.enrolledStudents?.includes(
    user?._id
  )
) && (
<div className="mt-10">

  <h2 className="text-3xl font-bold mb-6">
    Course Videos
  </h2>

  {course.videos?.length === 0 && (
    <p>No videos added yet</p>
  )}

  {course.videos?.map((video, index) => (

    <div
      key={index}
      className="mb-8"
    >

      <h3 className="text-xl font-semibold mb-3">
        {video.title}
      </h3>

      <iframe
        width="100%"
        height="400"
        src={video.videoUrl.replace(
          "watch?v=",
          "embed/"
        )}
        title={video.title}
        frameBorder="0"
        allowFullScreen
        className="rounded"
      ></iframe>
      {user?.role === "student" && (
       <button
onClick={() => watchVideo(video._id)}
  className="bg-purple-500 text-white px-4 py-2 rounded mt-4"
>
  Mark as Watched
</button>
      )}

{user?.role === "teacher" && (

<button
  onClick={() => deleteVideo(video._id)}
  className="bg-red-500 text-white px-4 py-2 rounded mt-4 ml-4"
>
  Delete Video
</button>

)}

    </div>

  ))}

</div>
)}
{user?.role === "teacher" && (

<button
  onClick={deleteCourse}
  className="bg-red-600 text-white px-6 py-3 rounded mt-6 mr-4"
>
  Delete Course
</button>

)}
{/* Show enroll button only for students
who are NOT enrolled */}

{user?.role === "student" && (

course.enrolledStudents?.includes(
  user?._id
) ? (

<button
  onClick={unenrollCourse}
  className="bg-red-500 text-white px-6 py-3 rounded mt-6"
>
  Withdraw
</button>

) : (

<button
  onClick={enrollCourse}
  className="bg-green-500 text-white px-6 py-3 rounded mt-6"
>
  Enroll Now
</button>

)

)}

        </div>

      </div>
    </>
  );
}

export default CourseDetails;