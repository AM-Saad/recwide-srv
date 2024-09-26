const { exec } = require("child_process");

/**
 * Converts a video to MP4 format using FFmpeg without re-encoding the streams.
 *
 * @param {string} videoPath Path to the source video file.
 * @param {string} outputPath Path to the output MP4 file.
 * @param {function} callback Callback function that gets called after completion.
 */
function convertToMP4(videoPath, outputPath, callback) {
  console.log("Converting to MP4...");
  console.log("Video path:", videoPath);
  console.log("Output path:", outputPath);
  const command = `ffmpeg -i "${videoPath}" -c copy -f mp4 "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      callback(error, null);
      return;
    }
    if (stderr) {
      console.warn(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    callback(null, outputPath);
  });
}

exports.convertToMP4 = convertToMP4;
