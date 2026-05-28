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
router.post(
  "/unenroll/:id",
  authMiddleware,
  unenrollCourse
);
router.get("/:id", getCourseById);

module.exports = router;