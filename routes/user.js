const express = require("express");
const { body } = require("express-validator/check");
const User = require("../models/User");
const userController = require("../controllers/user");
const isAuth = require("../middleware/isAuth");

const router = express.Router();


router.get("/videos", isAuth, userController.videos);
router.post("/videos", isAuth, userController.postVideo);



module.exports = router;
