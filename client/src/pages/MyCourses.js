import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import Navbar from "../components/Navbar";

function MyCourses() {

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {

    try {

      const token = localStorage.getItem(
        "token"
      );

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
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 p-6">

        <h1 className="text-4xl font-bold mb-8">
          My Courses
        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          {courses.map((course) => (

            <div
              key={course._id}
              className="bg-white rounded shadow overflow-hidden"
            >

              <img
                src={course.thumbnail}
                alt="course"
                className="w-full h-52 object-cover"
              />

              <div className="p-4">

                <h2 className="text-2xl font-bold">
                  {course.title}
                </h2>

                <p className="text-gray-600 mt-2">
                  {course.description}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Instructor:
                  {" "}
                  {course.instructor?.name}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>
    </>
  );
}

export default MyCourses;