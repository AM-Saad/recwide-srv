const User = require("../models/User");
const bcrypt = require("bcryptjs");
const fsExtra = require("fs-extra"); // Correctly import fs-extra
const fs = require("fs");
const path = require("path");
const { createThumbnails } = require("../util/create-thumbnails");
const getVideoDuration = require("../util/videoDuration");
const concatenateVideos = require("../util/processVideo");
const { convertToMP4 } = require("../util/convertToMp4");

async function mergeChunks(files, chunksDir, finalFilePath) {
  // Sort files by index before merging
  files.sort((a, b) => Number(a) - Number(b));

  for (const file of files) {
    const filePath = path.join(chunksDir, file);
    const data = await fsExtra.readFile(filePath);
    await fsExtra.appendFile(finalFilePath, data);

    await fsExtra.remove(filePath); // Remove the chunk file after merging
  }
}

exports.user = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ message: "User NOT found!!", messageType: "info" });
    return res.status(200).json({ message: "User Fetched", user: user });
  } catch (error) {
    if (!error.statusCode) {
      return (error.statusCode = 500);
    }
    next(error);
  }
};

const uploadsDir = path.join(__dirname, "uploads");
fsExtra.ensureDirSync(uploadsDir);

exports.uploadChunk = async (req, res, next) => {
  const { index, totalChunks, identifier } = req.body;
  const file = req.file;
  const chunksDir = path.join(__dirname, "..", "videos", "chunks", identifier); // Adjust path as necessary

  try {
    await fsExtra.ensureDir(chunksDir);
    const chunkPath = path.join(chunksDir, `${index}`);
    await fsExtra.move(file.path, chunkPath);

    const files = await fsExtra.readdir(chunksDir);
    if (files.length === Number(totalChunks)) {
      const mergeFilePath = path.join(
        __dirname,
        "..",
        "videos",
        `${identifier}.mp4`
      );

      await mergeChunks(files, chunksDir, mergeFilePath);
      await fsExtra.remove(chunksDir);

      const finalFilePath = path.join(
        __dirname,
        "..",
        "videos",
        `converted-${identifier}.mp4`
      );
      convertToMP4(mergeFilePath, finalFilePath, (error, outputPath) => {
        if (error) {
          console.error("Error converting to MP4:", error);
          return res.status(500).json({ success: false, message: "Error" });
        }
        console.log("Conversion finished successfully");
        return res
          .status(200)
          .json({ success: true, path: `/videos/${identifier}.mp4` });
      });
    } else {
      console.log(`Chunk ${index} received`);
      res.status(200).json({ success: true, message: "Chunk received" });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.uploadComplete = async (req, res, next) => {
  const { filename, totalChunks } = req.body;
  const tempDir = path.join("temp", filename);
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    const writeStream = fs.createWriteStream(filePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, i.toString());

      if (!(await fs.pathExists(chunkPath))) {
        throw new Error(`Missing chunk ${i}`);
      }

      const chunk = await fs.readFile(chunkPath);
      writeStream.write(chunk);

      await fs.remove(chunkPath); // Optionally remove chunk after appending
    }

    writeStream.end();

    writeStream.on("finish", () => {
      fs.remove(tempDir); // Clean up temp directory
      res.json({ message: "Upload completed", filename });
    });
  } catch (error) {
    console.error("Error completing upload", error);
    res.status(500).json({ error: "Error completing upload" });
  }
};

exports.concatenateVideos = async (req, res, next) => {
  const { videoPaths, outputPath } = req.body;
  try {
    const paths = videoPaths.map((i) => `${process.cwd()}/${i}`);
    const output = await concatenateVideos(
      paths,
      `${process.cwd()}/${outputPath}`
    );

    return res.status(200).json({
      message: "Created",
      messageType: "success",
      output: output,
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.generateThumbnail = async (req, res, next) => {
  const { videoPath } = req.body; // The path to the video file

  if (!videoPath) return res.status(400).send("Video path is required.");
  // Check if video file exists
  const relative_path = process.cwd();

  if (!fs.existsSync(relative_path + videoPath)) {
    return res.status(400).send("Video file not found.");
  }

  try {
    const videoFilename = path.basename(videoPath, path.extname(videoPath));
    const thumbnailsDir = `thumbnails/${videoFilename}`;

    const duration = await getVideoDuration(relative_path + videoPath);

    await createThumbnails(videoPath, thumbnailsDir, duration);
    return res.status(200).send("Thumbnails generated successfully.");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error generating thumbnails.");
  }
};

exports.getThumbnail = async (req, res, next) => {
  const { videoPath, id } = req.params; // The path to the video file
  const relative_path = process.cwd();

  //  Check if the directory that has tha name of the video path inside thumbnails directory is exists, then return array of all the names of the files inside it

  const videoFilename = path.basename(videoPath, path.extname(videoPath));
  const thumbnailsDir = `thumbnails/${videoFilename}`;
  if (!fs.existsSync(relative_path + thumbnailsDir)) {
    return res.status(400).send("Thumbnails directory not found.");
  }
  const thumbnails = fs.readdirSync(`${relative_path}/${thumbnailsDir}`);
  console.log(thumbnails);
  return res.status(200).json({ thumbnails });
};

exports.unlinkMedia = async (req, res, next) => {
  const { media } = req.body;
  const relative_path = process.cwd();
  try {
    media.forEach((p) => {
      if (fs.existsSync(relative_path + p.url + ".mp4")) {
        fs.unlinkSync(relative_path + p.url + ".mp4");
      }
    });

    return res.status(200).json({
      message: "Deleted",
      messageType: "success",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateInfo = async (req, res, next) => {
  const { email, name } = req.body;
  try {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Please Re-Login", messageType: "alert" });
    }

    if (!email || !name) {
      return res
        .status(404)
        .json({ message: "All Info Are Required", messageType: "info" });
    }

    user.email = email;
    user.name = name;
    await user.save();

    return res.status(200).json({
      message: "Information Updated",
      messageType: "success",
      user: user,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  try {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Please Re-Login", messageType: "alert" });
    }
    const isMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isMatched) {
      return res
        .status(404)
        .json({ message: "Old password not correct", messageType: "alert" });
    }
    if (newPassword != confirmPassword) {
      return res
        .status(402)
        .json({ message: "Password Not Match", messageType: "alert" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      message: "Password changed successfully",
      messageType: "success",
      user: user,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const { spawn } = require("child_process");

exports.processVideo = async (req, res, next) => {
  const child = spawn("node", ["path/to/videoProcessingScript.js"]);

  child.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
  });

  res.send("Video processing started");
};
