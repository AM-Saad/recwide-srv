const express = require("express");
const { body } = require("express-validator/check");
const User = require("../models/User");
const userController = require("../controllers/user");
const isAuth = require("../middleware/isAuth");

const router = express.Router();


router.get("/", isAuth, userController.user);
router.get("/allprojects", userController.allprojects);
router.get("/projects", isAuth, userController.projects);
router.post("/projects", isAuth, userController.createProject);
router.delete("/projects/:id", isAuth, userController.deleteProject);


router.put('/info', isAuth, userController.updateInfo);
router.put('/password', isAuth, userController.changePassword);

module.exports = router;
