const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// Function to concatenate videos
const concatenateVideos = (videoPaths, outputPath) => {
    return new Promise((resolve, reject) => {
        // Create a file listing all videos to concatenate
        const fileList = `${process.cwd()}/videos/filelist.txt`
        const fileContent = videoPaths.map(path => `file '${path}'`).join('\n');
        fs.writeFileSync(fileList, fileContent);
        console.log(`Created filelist at: ${fileList}`);

        // Use ffmpeg to concatenate videos
        ffmpeg()
            .input(fileList)
            .inputOptions(['-f concat', '-safe 0'])
            .outputOptions('-c copy')
            .output(outputPath)
            .on('end', () => {
                console.log('Videos concatenated successfully');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error concatenating videos:', err);
                reject(err);
            })
            .run();
    });
};

module.exports = concatenateVideos;
