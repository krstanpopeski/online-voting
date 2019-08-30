var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const OptionsSchema = new Schema({
    name: String,
    key: String,
    votes: Number
});

const ImageSchema = new Schema({
    url: String,
    type: String
});

const CommentsSchema = new Schema({
   authorId: {type: String, required: true},
   authorName: {type: String, required: true},
   content: {type: String, required: true},
}, {
    timeStamps: true
});


const PollSchema = new Schema({
    author: {type: String, required: true},
    authorId: {type: String, required: true},
    title: {type: String, required: true},
    options: [OptionsSchema],
    expireDate: Date,
    image: ImageSchema,
    description: {type: String, required:true},
    likes: {type: Number},
    comments: [CommentsSchema]
}, {
    timestamps: true
});


module.exports = mongoose.model('Poll', PollSchema, 'Polls');