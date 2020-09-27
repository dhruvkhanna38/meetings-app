const jwt = require("jsonwebtoken");
const User = require("../models/user");


const auth = async (req , res , next )=>{
    try{ 
        if(req.header('Authorization')){
            
            const token = req.header('Authorization').replace('Bearer ' , '');
            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            const user = await User.findOne({_id: decoded._id , 'tokens.token' : token});
            await user.populate('meetings').execPopulate();

            if(!user){
                throw new Error();
            }
            req.token = token;
            req.user = user;
            req.meetings = user.meetings;
            next();
        }
        else{
            throw new Error("Token not found");
        }
        
    }
    catch(error){
        res.status(401);
        res.send({error: 'please authenticate'});
    }    
}

module.exports = auth;