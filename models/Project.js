const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref:'User' },
    name: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        required: true
    },
    audioSettings: {
        type: String,
        required: true
    },
    resolution: {
        type: String,
    },
    videos: [
        {
            name: String,
            url: String,
            extension: String
        }
    ],
    date:String

});


module.exports = mongoose.model('Project', projectSchema);
