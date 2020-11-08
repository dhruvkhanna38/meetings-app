const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const Meeting = require("../models/meeting")
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");

const crypto = require("crypto");
const isNotVerified = require("../middleware/verifyEmail");



//Get Profile
router.get("/users/me" ,auth,  async (req, res)=>{
    res.send({user:req.user.getPublicProfile(), meetings:req.meetings});
})

//Get email
router.get("/emails" , auth, async(req, res)=>{
    const emails  = await User.find({}).select({email:1});
    res.send(emails);
});

//check if verified

router.get("/checkVerification", async(req, res)=>{
    const user = await User.findOne({emailToken:req.query.emailToken});
    if(user.isVerified){
        res.send({isVerified:true});
    }else{
        res.send({isVerified:false});
    }
})

//Signup
router.post("/users", async (req, res)=>{
    
    
    try{ 
        const newUser = {...req.body,
            emailToken:await crypto.randomBytes(64).toString('hex')
           }
        const user = new User(newUser);
        if(user){
            let fromMail = 'noreply@meetingsApp.com';
            let toMail = user.email;
            let subject = "Verify Email";
            let text = `Verify your account by clicking on the following link -: http://${req.headers.host}/verify-email?token=${user.emailToken}`;
    
            const transporter = nodemailer.createTransport({
                                                            service: 'gmail',
                                                            auth: {
                                                            user: "dhruvk.me.16@nsit.net.in" ,
                                                            pass: process.env.GMAIL_PASS
                                                            }
                                                            });
            let mailOptions = {
                            from: fromMail,
                            to: toMail,
                            subject: subject,
                            text: text
            };
            await transporter.sendMail(mailOptions);
            //await mg.messages().send(data);
            //await sgMail.send(message);
            console.log("sent");
            await user.save();
            res.status(201).send({emailToken:user.emailToken});
        }else{
            throw new Error("Email Id Already in Use");
        }
    }catch(error){
        console.log(error);
        res.status(400).send(error.message);
    }
})

router.get("/verify-email", async(req, res, next)=>{
    try{
        const user = await User.findOne({emailToken:req.query.token});
        if(!user){
            return res.status(404).send();
        }
        user.isVerified = true;
        await user.save();
        const token = await user.generateAuthToken();
        res.send({message:"Email Verification Completed"});
        
    }catch(error){
        console.log(error);
        res.status(400).send(error.message);
    }
});

//Login user
router.post("/users/login" ,isNotVerified,  async(req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user: user.getPublicProfile(), token});
    }catch(error){
        res.status(400).send(error.message);
    }
})

//Logout
router.post("/users/logout" , auth, async(req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>token.token !== req.token);
        await req.user.save();
        res.send();
    }
    catch(error){
        res.status(500).send();
    }

});


//Logout All
router.post("/users/logoutAll" , auth, async (req, res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch(error){
        res.status(500).send();
    }
});

//Update user
router.patch("/users/me" ,auth, async(req, res)=>{
    const _id  = req.user._id;
  //  ObjectId("5e24b318e791af44ea25e1a4")
    const updates = Object.keys(req.body);
    const validUpdates = ['name' , 'age' , 'email' , 'password'];
    const isValidUpdate = updates.every((update)=>{
            return validUpdates.includes(update);
    });
    if(!isValidUpdate){
        return res.status(404).send({error : "invlid update"});
    }
    try{ 
        const user = req.user;
        updates.forEach((update)=>{
            user[update] = req.body[update]; 
        });
        
        await user.save();

        //const user = await User.findByIdAndUpdate(_id , req.body , {new: true , runValidators : true});
        // if(!user){
        //     res.status(404).send();
        // }
        res.status(200).send({user:user.getPublicProfile()});
    }catch(error){
        res.status(500).send(error);
    }

});

//update email
router.patch("/users/me/updateEmail", auth ,async (req, res)=>{
    const newEmail = req.body.body.email;
    const oldEmail = req.user.email;
    
    try{
        const meetings = await Meeting.find({emails:req.user.email})
        meetings.forEach(meeting=>{
            let newEmailsArray = [];
            meeting.emails.forEach(email=>{
                if(email === oldEmail){
                    newEmailsArray.push(newEmail)
                }else{
                    newEmailsArray.push(email)
                }
            })
            meeting.emails = []
            meeting.emails = newEmailsArray;
            meeting.save();
        })
        req.user.email = newEmail;
        await req.user.save();
        res.send();
    }catch(error){
        res.status(400);
        res.send(error);
    }

})

//update password
router.patch("/users/me/password" , auth, async(req, res)=>{
    const currentPassword = req.body.body.currentPassword;
    const newPassword = req.body.body.newPassword;
    try{
        const match = await bcrypt.compare(currentPassword, req.user.password);
        if(!match){
            throw new Error("Wrong Password");
        }
        
        req.user.password = newPassword;
        
        await req.user.save();
        res.send();
    }catch(error){
        res.status(401);
        res.send(error);
    }

});



//Delete User
router.delete("/users/me" ,auth,  async (req, res)=>{
    try{
        const user = await User.findByIdAndDelete(req.user._id);
        if(!user){
            return res.status(404).send();
        }
        res.send(user);
    }catch(error){
        res.statusCode = 400;
        res.send(error.message);
    }
});

const upload  = multer({
    limits:{
        fileSize:2000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return callback(new Error("File extension must be .jpg, .jpeg or .png"));
        }
        callback(undefined, true);
    }
})


//update profile image
router.post("/users/me/profileNavbar" ,auth, upload.single('avatar'), async (req, res)=>{
    //req.user.avatar = req.file.buffer;
    const profileBuffer = await sharp(req.file.buffer).resize({width:40, height:40}).png().toBuffer();
    const pictureBuffer = await sharp(req.file.buffer).resize({width:200, height:200}).png().toBuffer();
    req.user.avatar = pictureBuffer;
    req.user.profileImage = profileBuffer;
    await req.user.save();
    res.send();
},(error, req, res, next)=>{
    res.status(400).send({error:error.message});
});

router.delete("/users/me/avatar", auth, async(req, res)=>{
    req.user.avatar = undefined;
    req.user.profileImage = undefined;
    await req.user.save();
    res.send();
});


router.get("/users/:id/avatar", async(req, res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error("Not Found");
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    }catch(error){
        res.statusCode = 400;
        res.send(error.message);
    }
})

router.get("/users/:id/profile",  async(req, res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.profileImage){
            throw new Error("Not Found");
        }
        res.set('Content-Type', 'image/png');
        res.send(user.profileImage);
    }catch(error){
        res.statusCode = 400;
        res.send(error.message);
    }
});

module.exports = router;