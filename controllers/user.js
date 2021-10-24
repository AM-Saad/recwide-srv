const User = require("../models/User");
const Video = require("../models/Video");
const Project = require("../models/Project");
const bcrypt = require("bcryptjs");



exports.user = async (req, res, next) => {

    try {
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: "User NOT found!!", messageType: 'info' });
        return res.status(200).json({ message: "User Fetched", user: user });
    } catch (error) {

        if (!error.statusCode) {
            return (error.statusCode = 500);
        }
        next(error);
    }
};


exports.projects = async (req, res, next) => {

    try {
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: "User NOT found!!", messageType: 'info' });
        let projects = await user.populate('projects').execPopulate()
        console.log(projects);
        return res.status(200).json({ message: "Video Fetched", projects: projects.projects });
    } catch (error) {

        if (!error.statusCode) {
            return (error.statusCode = 500);
        }
        next(error);
    }
};


exports.createProject = async (req, res, next) => {
    const { videos, name, mode, audioSettings, resolution, videotype, date } = req.body
    try {
        const user = await User.findById(req.user.id)
        // user.projects = []
        // await Project.deleteMany({})
        // await user.save()
        // await User.deleteMany({})

        let projectvideos = videos.map((i) => ({
            name: i,
            url: `/videos/${i}.${videotype}`
        }))
        const newProject = new Project({
            videos: projectvideos,
            name,
            mode,
            audioSettings,
            resolution,
            extension: videotype,
            user: user._id,
            date: date
        })
        await newProject.save()
        user.projects.push(newProject._id)
        await user.save()

        // req.user.videos.push({
        //     videos: projectvideos,
        //     name,
        //     mode,
        //     audioSettings,
        //     resolution,
        //     extension: videotype
        // })
        let projects = await user.populate('projects').execPopulate()
        return res.status(200).json({ message: 'Created', messageType: 'success', projects: projects.projects })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};


exports.deleteVideo = async (req, res, next) => {

    const name = req.params.name
    const relative_path = process.cwd()

    fs.unlinkSync(relative_path + "/videos/" + name);
    return res.redirect('/')
}



exports.updateInfo = async (req, res, next) => {
    const { email, name } = req.body
    try {
        const user = await User.findOne({ _id: req.user.id })
        if (!user) {
            return res.status(404).json({ message: "Please Re-Login", messageType: 'alert' })
        }

        if (!email || !name) {
            return res.status(404).json({ message: "All Info Are Required", messageType: 'info' })
        }

        user.email = email
        user.name = name
        await user.save()

        return res.status(200).json({ message: "Information Updated", messageType: 'success', user: user })



    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}
exports.changePassword = async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    try {
        const user = await User.findOne({ _id: req.user.id })
        if (!user) {
            return res.status(404).json({ message: "Please Re-Login", messageType: 'alert' })

        }
        const isMatched = await bcrypt.compare(oldPassword, user.password)
        if (!isMatched) {
            return res.status(404).json({ message: "Old password not correct", messageType: 'alert' })
        }
        if (newPassword != confirmPassword) {
            return res.status(402).json({ message: "Password Not Match", messageType: 'alert' })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()
        return res.status(200).json({ message: "Password changed successfully", messageType: 'success', user: user })


    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}