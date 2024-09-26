const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const frames = (duration) => {
  // Extract hours, minutes, and seconds from the duration string
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  // Calculate total duration in minutes
  console.log(Math.round(seconds))
  const totalMinutes = hours * 60 + minutes + Math.round(seconds) / 60;
  return Math.ceil(totalMinutes) * 4 
};
const createThumbnails = async (videoPath, thumbnailsDir, duration) => {
  if (!videoPath || !thumbnailsDir) return;
  const relative_path = process.cwd();

  // Create a directory to store thumbnails if it doesn't exist
  if (!fs.existsSync(relative_path + thumbnailsDir)) {
    fs.mkdirSync(relative_path + thumbnailsDir, { recursive: true });
  }
  ffmpeg(relative_path + videoPath)
    .on("end", () => {
      console.log("Thumbnails have been generated.");
    })
    .on("error", (err) => {
      console.error("Error generating thumbnails:", err.message);
    })
    .screenshots({
      // Will take screenshots at 20% 40%, 60% and 80% of the video
      count: frames(duration),
      folder: thumbnailsDir,
      size: "320x240",
      // %b input basename (filename w/o extension)
      filename: "thumbnail-at-%s-seconds.png",
    });
};

exports.createThumbnails = createThumbnails;
