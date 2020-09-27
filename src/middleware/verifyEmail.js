const User  = require("../models/user");


const isNotVerified = async (req, res, next)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);        
        if(!user){
           throw new Error("User Not Found");
        }
        if(!user.isVerified){
            throw new Error("User Not Verified");
        }
        if(user.isVerified){
            next();
        }
    }catch(error){
        res.status(404);
        res.send({error:"Please Verify Your Email"})
    }
}

module.exports = isNotVerified;