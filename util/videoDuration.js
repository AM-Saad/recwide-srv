const { exec } = require("child_process");

const getVideoDuration = (videoPath) => {
    return new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${videoPath}" 2>&1 | grep "Duration"`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Error: ${stderr}`);
                return;
            }

            const match = stdout.match(/Duration: (\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (match && match[1]) {
                resolve(match[1]);
            } else {
                reject('Duration not found');
            }
        });
    });
};



module.exports = getVideoDuration;