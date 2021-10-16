const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    image: String,
    resetToken: String,
    resetTokenExpr: Date,
    signUpToken: String,
    signUpTokenExpr: Date,
    videos: [{}]

});


module.exports = mongoose.model('User', userSchema);
