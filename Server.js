const dotenv = require('dotenv');
const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const User = require("./User");
const Poll = require("./PollModel");
const app = express();
const cors = require('cors');
const withAuth = require("./middleWare");
const multer = require('multer');
const path = require('path');

dotenv.config();

const mongo_uri = 'mongodb://localhost/onlineVoting';

mongoose.connect(mongo_uri, function(err){
    if(err){
        throw err;
    }
    else{
        console.log(`Successfully connected to ${mongo_uri}`);
    }
});


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' +file.originalname )
    }
});

let upload = multer({ storage: storage }).single('file');



app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors({credentials:true,origin:true}));

app.post('/api/register', function(req,res){
    const { name, email, password } = req.body;
    const user = new User({name,email,password,votesOnPolls: []});
   User.findOne({ email }, function(err, user2){
       if(user2){
           res.status(500).json({error: "Email already exists. "});
       }
       else{
           user.save(function(err){
               if(err){
                   res.status(500).json({error: "There was an error while registering a new user!"});
                   console.log(err);
               } else{
                   res.sendStatus(200);

               }
           });
       }
    });
});

app.post('/api/authenticate', function(req, res){
    const{email,password} = req.body;
    User.findOne({ email }, function(err, user){

        if(err){
            res.status(500).json({error: "Internal error please try again!"});
        }
        else if(!user){
            res.status(401).json({error: "Incorrect email or password!"});
        }
        else{
            user.isCorrect(password, function(err, same){
                if(err){
                    res.status(500).json({
                        error: "Internal error, please try again!"
                    });

                }
                else if(!same){
                    res.status(401).json({
                        error: "Incorrect email or password!"
                    });
                }
                else{
                    const payload = { id: user._id, email: user.email, name:user.name, votes:user.votesOnPolls};
                    const token = jwt.sign(payload,process.env.SECRET, {expiresIn: '1h'});
                    res.status(200).json({
                        user:{id: user._id, name: user.name, email:user.email},
                        token:token
                    });
                }
            });
        }
    });
});


app.post('/api/upload', function(req, res){
    upload(req,res,(err) => {
        if(err instanceof multer.MulterError){
            console.log(err);
            return res.status(500).json(err);
        }
        else if(err){
            console.log(err);
            return res.status(500).json(err);
        }
        let data = JSON.parse(req.body.json);
        let poll = {
            author: data.author,
            authorId: data.authorId,
            title: data.title,
            options: data.options,
            expireDate: data.expireDate,
            image: {
                url: req.file.path,
                type: req.file.mimetype
            },
            description: data.description,
            likes: 0,
            comments: []
        };
        console.log(poll);
        let newPoll = new Poll(poll);
        newPoll.save((err) => {
            if(err){
                console.log(err);
                res.status(500).json({error: "Internal error! Failed to save poll to database!"});
            }
            else{
                res.status(200).json({success: "Successfully saved poll to database!"});
            }
        })

    })
});

app.get('/api/polls', (req, res) => {
    Poll.find({}, null, {sort: {createdAt : 'desc'}}, (err, polls) => {
        if(err){
            res.status(500).json({error: 'Internal error! Please try again!'});
        }
        else{
            res.status(200).json(polls);
        }
    })
});

app.get('/api/image/:directory/:fileName', (req,res) => {
    let fileName = req.params.fileName;
    let directory = req.params.directory;
    res.sendFile(path.join(__dirname, './',directory,fileName));
});

app.post('/api/vote', (req,res) => {
    const vote = req.body;
    Poll.findById(vote.pollId, (err, poll) => {
       if(err){
           res.send(500).json({error: "Internal error! Something went wrong!"});
       }
       else{
           poll.options.forEach(option => {
                if(option._id.toString().localeCompare(vote.voteId) === 0){
                    option.votes++;
                }

           });
           poll.save((err) => {
               if(err){
                   res.send(500).json({error: "Unable to save poll! Internal error!"});
               }
               else{
                   const voteOnPoll = {
                       pollId: vote.pollId,
                       voteId: vote.voteId
                   };
                   User.findByIdAndUpdate(vote.userId, {$push: {votesOnPolls: voteOnPoll}}, {new: true}, (err, doc) =>{
                        if(err){
                            console.log(err);
                            res.send(500).json({error: "Error while updating user with new polls.Internal Error!"});
                        }
                        else{
                            res.sendStatus(200);
                        }
                   })

               }
           });
       }
    });

});

app.post('/api/like', (req,res) => {
    const data = req.body;
    Poll.findById(data.pollId ,(err, doc) =>{
        if(err){
            res.send(500).json({error: "Internal error while findById! Try again!"});
        }
        else{
            doc.likes++;
            doc.save((err, poll)=>{
                if(err){
                    res.send(500).json({error: "Internal error while adding like! Try again!"});
                }
                else{
                    res.sendStatus(200);
                }
            })
        }
    });


});

app.post('/api/comment', (req, res) => {
   let data = req.body;
   let newComment = {
       authorId: data.authorId,
       authorName: data.authorName,
       content: data.value
   };

   Poll.findByIdAndUpdate(data.pollId, {$push: {comments: newComment}}, {new: true},(err, doc) => {
        if(err){
            res.status(500).json({error: "Internal error while adding comment! Try again!"});
        }
        else{
            res.status(200).json(doc.comments[doc.comments.length-1]);
        }
   })

});

app.post('/api/delete', (req, res) => {
   let data = req.body;
   Poll.findByIdAndDelete(data.pollId, (err,doc) => {
       if(err){
           res.send(500).json({error: "There was an internal error while deleting the poll! Try again!"});
       }
       else{
           res.sendStatus(200);
       }
   })

});

app.get('/api/status', function(req,res){
   res.status(200).json({response: "OK"});
});

app.get('/api/verify', withAuth, function(req,res){
    let user = req.user;
   res.status(200).json({_id: user.id, email: user.email, name: user.name, votes:user.votes});

});

app.listen(3001, () => console.log("Server started."));