require("dotenv").config();
const jwt = require("jsonwebtoken");

const withAuth = function(req,res,next){
    var token = req.headers['authorization'];
    if(!token){
        res.status(401).json({error: 'Unauthorized access!'});
    }
    else{
        jwt.verify(token,process.env.SECRET,function(err,decoded){
            if(err){
                res.status(401).json({error: 'Unauthorized access!'});
            }
            else{
                req.user = decoded;
                next();
            }
        });
    }
};

module.exports = withAuth;