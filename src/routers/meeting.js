const express = require("express");
const router = new express.Router();
const Meeting = require("../models/meeting");
const auth = require("../middleware/auth");
const moment = require("moment");

//Get Meetings
router.get("/meetings" ,auth,  async (req, res)=>{

    try{
       const userId = req.user._id;
       const meetings = await Meeting.find({emails:req.user.email});
       res.send(meetings);
    }catch(error){
        res.statusCode = 500;
        res.send(error.message);
    }
});


//Search For Meetings
router.get("/meetings/search" , auth, async(req, res)=>{
    const date = req.query.date;
    const searchTerm  = req.query.desc;
    console.log(req.query.date, searchTerm);
    
    try{
        if(date==="All"){
            const meetings =await Meeting.find({description:{$regex:searchTerm||'', $options:'i'},emails:req.user.email});
            res.send(meetings);
        }else if(date==="Today"){
            const today = moment().format('DD/MM/YYYY');
            const meetings =await Meeting.find({description:{$regex:searchTerm||'', $options:'i'}, dateOfMeeting:today,emails:req.user.email});
            res.send(meetings);
        }else if(date==="Past"){
            const today = moment().format('DD/MM/YYYY');
            const meetings =await Meeting.find({description:{$regex:searchTerm||'', $options:'i'}, dateOfMeeting:{$lt:today},emails:req.user.email});
            res.send(meetings);
        }else if(date=="Upcoming"){
            const today = moment().format('DD/MM/YYYY');
            const meetings =await Meeting.find({description:{$regex:searchTerm||'', $options:'i'}, dateOfMeeting:{$gt:today},emails:req.user.email});
            res.send(meetings);
        }else{
            const meetings =await Meeting.find({description:{$regex:searchTerm||'', $options:'i'}, dateOfMeeting:req.query.date,emails:req.user.email});
            res.send(meetings);
        }
    }catch(error){
        res.statusCode = 500;
        res.send(error.message);
    }
});

//Search for meeting by ID
router.get("/meetings/:id",auth ,async (req, res)=>{
    const _id = req.params.id;
    try{
        const meeting = await Meeting.findById(_id);
        if(!meeting){
            return res.status(404).send();
        }
        res.send(meeting);
    }catch(error){
        res.statusCode = 500;
        res.send(error.message);
    }
}); 


//Post New Meeting
router.post("/meetings" ,auth, async (req, res)=>{
    const meeting = new Meeting({...req.body, creator:req.user._id});
    
    try{
       meeting.emails.push(req.user.email);
       await meeting.save();
       res.send(meeting);
    }catch(error){
        
        res.statusCode = 400;
        res.send(error.message);
    }
});

//Excuse Member from meeting
router.patch("/meetings/removeUser/:id",auth ,async(req, res)=>{
    const removeEmail = req.user.email;
    console.log(removeEmail);
    console.log(req.params);
    
    try{    
        
        const meeting = await Meeting.findById(req.params.id);
        
        if(!meeting){
            return res.status(404).send();
        }
        const newMeetingArray  = meeting.emails.filter(email=>email!==removeEmail && email!==null)
        meeting.emails = [];
        newMeetingArray.forEach(email=>{
            meeting.emails.push(email);
        });
        if(meeting.emails.length === 0){
            await Meeting.deleteOne({_id:req.params.id});
            res.send()
        }
        else{
            await meeting.save();
            res.status(200);
            res.json(meeting)
        }
        
    }catch(error){
        res.statusCode = 400;
        res.send(error.message);
    }
});


//Add Member to meeting
router.patch("/meetings/addUser/:id", auth, async(req, res)=>{
    const addEmail = req.body.body.email;
    console.log(addEmail);
    try{
        const meeting = await Meeting.findOne({_id:req.params.id});
        if(!meeting){
            return res.status(404).send();
        }
        if(meeting.emails.indexOf(addEmail)===-1 && addEmail!==undefined){
            meeting.emails.push(addEmail);
        }
        await meeting.save();
        res.json(meeting);
    }catch(error){
        res.statusCode = 400;
        res.send(error.message);
    }
})

//Update meeting by id
router.patch("/meetings/:id",auth, async (req, res)=>{
    const allowedUpdates = ['description', 'startHour' , 'startMin' , 'endHour', 'endMin' , 'dateOfMeeting' , 'emails'];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update);
    });

    if(!isValidOperation){
        return res.status(400).send({error:{message:"Invalid Operation"}});
    }

    try{
        const meeting = await Meeting.findOne({_id:req.params.id, creator:req.user._id});
        
       // const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body,{new:true, runValidators:true});
        if(!meeting){
            return res.status(404).send();
        }
        updates.forEach((update)=>{
            if(update!=='emails'){
                meeting[update] = req.body[update]
            }
        })
        if(updates.indexOf('emails')!==-1){
            req.body.emails.forEach(email=>{
                meeting.emails.push(email);
            })
        }
        await meeting.save();
        res.json(meeting)
    }catch(error){
        res.statusCode = 400;
        res.send(error.message);
    }
});


//Delete a meeting
router.delete("/meetings/:id",auth, async(req, res)=>{
    try{
        const meeting = await Meeting.findOneAndDelete({_id:req.params.id , creator:req.user._id});
        if(!meeting){
            return res.status(404).send();
        }
        res.send(meeting);
    }catch(error){
        res.statusCode = 400;
        res.send(error.message);
    }
});

module.exports = router;


