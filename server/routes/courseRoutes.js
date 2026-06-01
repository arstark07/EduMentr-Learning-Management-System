const express = require("express");

const router = express.Router();

const {
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
} = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/create",
  authMiddleware,
  createCourse
);

router.post(
  "/enroll/:id",
  authMiddleware,
  enrollCourse
);

router.get("/", getCourses);
router.get(
  "/my/enrolled",
  authMiddleware,
  getMyCourses
);
router.post(
  "/video/:id",
  authMiddleware,
  addVideoToCourse
);
router.post(
  "/watch/:courseId/:videoId",
  authMiddleware,
  watchVideo
);
router.delete(
  "/video/:courseId/:videoId",
  authMiddleware,
  deleteVideo
);
router.delete(
  "/:id",
  authMiddleware,
  deleteCourse
);
router.put(
  "/:id",
  authMiddleware,
  updateCourse
);
router.post(
  "/unenroll/:id",
  authMiddleware,
  unenrollCourse
);
router.get("/:id", getCourseById);

// Reviews routes
router.get("/:id/reviews", getReviews);
router.post("/:id/reviews", authMiddleware, addReview);

// Q&A routes
router.post("/:id/questions", authMiddleware, addQuestion);
router.post("/:id/questions/:questionId/reply", authMiddleware, replyToQuestion);

module.exports = router;