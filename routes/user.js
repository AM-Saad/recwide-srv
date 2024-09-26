const express = require("express");
const { body } = require("express-validator/check");
const User = require("../models/User");
const userController = require("../controllers/user");
const isAuth = require("../middleware/isAuth");
const { upload } = require("../util/multer_config"); // Adjust the path as necessary

const router = express.Router();

router.get("/me", isAuth, userController.user);

router.post(
  "/projects/upload/chunk",
  upload.single("file"),
  userController.uploadChunk
);
router.post("/upload-complete", userController.uploadComplete);
router.post("/projects/concatenate", userController.concatenateVideos);
router.post("/projects/unlink", userController.unlinkMedia);
router.post("/projects/thumbnails", userController.generateThumbnail);
router.get("/projects/:id/thumbnails/:videoPath", userController.getThumbnail);

router.put("/info", isAuth, userController.updateInfo);
router.put("/password", isAuth, userController.changePassword);

module.exports = router;
