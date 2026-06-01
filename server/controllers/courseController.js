const Course = require("../models/Course");
const Review = require("../models/Review");

const createCourse = async (req, res) => {

  try {

    // Only teacher can create course
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can create courses",
      });
    }

    const {
      title,
      description,
      thumbnail,
      category,
    } = req.body;

    const course = await Course.create({
      title,
      description,
      thumbnail,
      category: category || "Other",

      // Logged-in teacher becomes instructor
      instructor: req.user.userId,
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

const getCourses = async (req, res) => {

  try {

    const courses = await Course.find()
      .populate(
        "instructor",
        "name email"
      );

    res.status(200).json(courses);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

const getCourseById = async (req, res) => {

  try {

    const course = await Course.findById(
      req.params.id
    ).populate(
      "instructor",
      "name email profilePic"
    ).populate(
      "questions.user",
      "name profilePic"
    ).populate(
      "questions.replies.user",
      "name profilePic"
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json(course);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

const enrollCourse = async (req, res) => {

  try {
        if (req.user.role === "teacher") {
      return res.status(403).json({
        message: "Teachers cannot enroll in courses",
      });
    }
    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Prevent duplicate enrollment
    if (
      course.enrolledStudents.includes(
        req.user.userId
      )
    ) {
      return res.status(400).json({
        message: "Already enrolled",
      });
    }

    course.enrolledStudents.push(
      req.user.userId
    );

    await course.save();

    res.status(200).json({
      message: "Enrolled successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};
const addVideoToCourse = async (req, res) => {

  try {

    // Only teacher can add videos
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can add videos",
      });
    }

    const { title, videoUrl } = req.body;

    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    if (
  course.instructor.toString() !==
  req.user.userId
) {
  return res.status(403).json({
    message:
      "You can only add videos to your own courses",
  });
}

    course.videos.push({
      title,
      videoUrl,
    });

    await course.save();

    res.status(200).json({
      message: "Video added successfully",
      course,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};
const watchVideo = async (req, res) => {

  try {

    const {
      courseId,
      videoId,
    } = req.params;

    const course = await Course.findById(
      courseId
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const video = course.videos.id(
      videoId
    );

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    if (
      !video.watchedBy.includes(
        req.user.userId
      )
    ) {
      video.watchedBy.push(
        req.user.userId
      );

      await course.save();
    }

    res.status(200).json({
      message: "Video marked as watched",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteVideo = async (req, res) => {

  try {

    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can delete videos",
      });
    }

    const {
      courseId,
      videoId,
    } = req.params;

    const course = await Course.findById(
      courseId
    );
    if (
  course.instructor.toString() !==
  req.user.userId
) {
  return res.status(403).json({
    message:
      "You can only delete videos from your own courses",
  });
}

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    course.videos = course.videos.filter(
      (video) =>
        video._id.toString() !== videoId
    );

    await course.save();

    res.status(200).json({
      message: "Video deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteCourse = async (req, res) => {

  try {

    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can delete courses",
      });
    }

    const course = await Course.findById(
      req.params.id
    );
    if (
  course.instructor.toString() !==
  req.user.userId
) {
  return res.status(403).json({
    message:
      "You can only delete your own courses",
  });
}
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    

    await Course.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Course deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};
const getMyCourses = async (req, res) => {

  try {

    let courses;

    // STUDENT
    if (req.user.role === "student") {

      courses = await Course.find({
        enrolledStudents: req.user.userId,
      }).populate(
        "instructor",
        "name email"
      );

    }

    // TEACHER
    else if (req.user.role === "teacher") {

      courses = await Course.find({
        instructor: req.user.userId,
      }).populate(
        "instructor",
        "name email"
      );

    }

    res.status(200).json(courses);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};
const unenrollCourse = async (
  req,
  res
) => {

  try {

    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Remove student from enrolledStudents
    course.enrolledStudents =
      course.enrolledStudents.filter(
        (studentId) =>
          studentId.toString() !==
          req.user.userId
      );

    await course.save();

    res.status(200).json({
      message:
        "Course unenrolled successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const courseId = req.params.id;
    const userId = req.user.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the student is enrolled (or is the instructor/admin)
    const isEnrolled = course.enrolledStudents.includes(userId);
    const isInstructor = course.instructor.toString() === userId;
    if (!isEnrolled && !isInstructor && req.user.role !== "admin") {
      return res.status(403).json({ message: "You must be enrolled to leave a review" });
    }

    // Upsert review (update if exists, insert if new)
    const review = await Review.findOneAndUpdate(
      { course: courseId, user: userId },
      { rating: Number(rating), comment: comment || "" },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const courseId = req.params.id;
    const reviews = await Review.find({ course: courseId })
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { text } = req.body;
    const courseId = req.params.id;
    const userId = req.user.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.questions.push({
      user: userId,
      text,
      replies: []
    });

    await course.save();

    const updatedCourse = await Course.findById(courseId)
      .populate("questions.user", "name profilePic")
      .populate("questions.replies.user", "name profilePic");

    res.status(200).json({
      message: "Question posted successfully",
      questions: updatedCourse.questions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const replyToQuestion = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: courseId, questionId } = req.params;
    const userId = req.user.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const question = course.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.replies.push({
      user: userId,
      text
    });

    await course.save();

    const updatedCourse = await Course.findById(courseId)
      .populate("questions.user", "name profilePic")
      .populate("questions.replies.user", "name profilePic");

    res.status(200).json({
      message: "Reply posted successfully",
      questions: updatedCourse.questions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only teachers can update courses",
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You can only edit your own courses",
      });
    }

    const { title, description, thumbnail, category } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (thumbnail) course.thumbnail = thumbnail;
    if (category) course.category = category;

    await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  enrollCourse,
  getMyCourses,
  addVideoToCourse,
  watchVideo,
  deleteVideo,
  deleteCourse,
  unenrollCourse,
  addReview,
  getReviews,
  addQuestion,
  replyToQuestion,
  updateCourse,
};