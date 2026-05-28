import React, {
  useState,
} from "react";
import { toast } from "react-toastify";
import axios from "axios";

import Navbar from "../components/Navbar";

import {
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaCamera,
} from "react-icons/fa";

function Profile() {

  const storedUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [user, setUser] = useState(
    storedUser
  );

  const [image, setImage] =
    useState(null);

  // Select image
  const handleImageChange = (e) => {

    setImage(e.target.files[0]);
  };

  // Upload profile photo
  const uploadProfilePic = async () => {

    try {

      const token = localStorage.getItem(
        "token"
      );

      const formData = new FormData();

      formData.append(
        "profilePic",
        image
      );

      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setUser(response.data.user);

      toast.success("Profile photo updated");

    } catch (error) {

      console.log(error);

      toast.error("Upload failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 flex justify-center items-center p-6">

        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-2xl">

          {/* Profile Image */}
          <div className="flex flex-col items-center">

            <img
              src={
                user?.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt="profile"
              className="w-36 h-36 rounded-full border-4 border-blue-500 shadow-lg object-cover"
            />

            <h1 className="text-4xl font-bold mt-5 text-gray-800">
              {user?.name}
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome to your profile
            </p>

          </div>

          {/* Upload Section */}
          <div className="mt-8 text-center">

            <label className="flex items-center justify-center gap-2 bg-gray-100 p-3 rounded-xl cursor-pointer hover:bg-gray-200 transition">

              <FaCamera className="text-blue-600" />

              <span>
                Choose Profile Photo
              </span>

              <input
                type="file"
                onChange={handleImageChange}
                className="hidden"
              />

            </label>

            <button
              onClick={uploadProfilePic}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl mt-5 transition"
            >
              Upload Photo
            </button>

          </div>

          {/* User Details */}
          <div className="mt-10 space-y-5">

            {/* Name */}
            <div className="flex items-center gap-4 bg-gray-100 p-5 rounded-2xl">

              <FaUser className="text-blue-600 text-2xl" />

              <div>
                <p className="text-gray-500">
                  Full Name
                </p>

                <h2 className="text-xl font-semibold">
                  {user?.name}
                </h2>
              </div>

            </div>

            {/* Email */}
            <div className="flex items-center gap-4 bg-gray-100 p-5 rounded-2xl">

              <FaEnvelope className="text-green-600 text-2xl" />

              <div>
                <p className="text-gray-500">
                  Email Address
                </p>

                <h2 className="text-xl font-semibold">
                  {user?.email}
                </h2>
              </div>

            </div>

            {/* Role */}
            <div className="flex items-center gap-4 bg-gray-100 p-5 rounded-2xl">

              <FaUserTag className="text-purple-600 text-2xl" />

              <div>
                <p className="text-gray-500">
                  Role
                </p>

                <h2 className="text-xl font-semibold capitalize">
                  {user?.role}
                </h2>
              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default Profile;