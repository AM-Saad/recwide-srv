const multer = require("multer");
const path = require("path");

// Configure Multer to use a temporary directory for uploads
const upload = multer({ dest: path.join(__dirname, "temp/") });

module.exports = { upload };
