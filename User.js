const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const VotesOnPolls = new mongoose.Schema({
    pollId:{type:String, unique: true},
    voteId:{type:String}
});

const UserSchema = new mongoose.Schema({
    name: {type:String, required: true},
    email: {type:String, required: true, unique: true},
    password: { type: String, required:true},
    votesOnPolls: [VotesOnPolls]
});

UserSchema.pre("save", function(next){
    if(this.isNew || this.isModified('password')) {
        const document = this;
        bcrypt.hash(document.password, 10, function (err, hashedPassword) {
            if (err) {
                next(err);
            }
            else {
                document.password = hashedPassword;
                next();
            }
        });
    } else {
        next();
    }
});

UserSchema.methods.isCorrect = function(password, callback){
    bcrypt.compare(password,this.password,function(err,same){
        if(err){
            throw err;
        }
        else{
            callback(err,same);
        }
    })
};

module.exports = mongoose.model('user', UserSchema);

