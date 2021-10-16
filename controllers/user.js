const User = require("../models/User");
const Video = require("../models/Video");


exports.videos = async (req, res, next) => {

    try {
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: "User NOT found!!", messageType: 'info' });
        let videos = await user.populate('videos').execPopulate()
        console.log(videos);
        return res.status(200).json({ message: "Video Fetched", videos: videos.videos });
    } catch (error) {

        if (!error.statusCode) {
            return (error.statusCode = 500);
        }
        next(error);
    }
};
exports.postVideo = async (req, res, next) => {

    console.log(req.body);
    try {

        return res.status(201).json({ message: "User Created", userId: user._id });
    } catch (error) {
        if (!error.statusCode) {
            return (error.statusCode = 500);
        }
        next(error);
    }
};