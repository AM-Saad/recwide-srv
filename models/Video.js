const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const videoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    chunks: [{ size: Number, type: String }],
    date: String

});


module.exports = mongoose.model('Video', videoSchema);
