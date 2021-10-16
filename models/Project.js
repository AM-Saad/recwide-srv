const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    mode:{
        type:String,
        required:true
    },
    audioSettings:{
        type:String,
        required:true
    },
    resolution:{
        type:String,
    },
    videos:[
        {
            name:String,
            url:String
        }
    ]

});


module.exports = mongoose.model('Project', projectSchema);
