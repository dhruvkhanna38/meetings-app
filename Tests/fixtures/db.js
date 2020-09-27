const jwt = require("jsonwebtoken");
const mongoose =require("mongoose");
const User = require("../../src/models/user");
const Meeting = require("../../src/models/meeting");


const userOneId = new mongoose.Types.ObjectId();

const userOne = {
    _id:userOneId,
    name:"Tony Soprano",
    email:"tonysoprano@gmail.com",
    password:"hello123",
    tokens:[{
        token:jwt.sign({_id:userOneId}, process.env.JWT_SECRET)
    }],
    isVerified:true
}

const userTwoId = new mongoose.Types.ObjectId();

const userTwo = {
    _id:userTwoId,
    name:"Tony Soprano Jr.",
    email:"tonysopranojr@gmail.com",
    password:"hello123",
    tokens:[{
        token:jwt.sign({_id:userTwoId}, process.env.JWT_SECRET)
    }],
    isVerified:true
}


const meeting1 = {
    _id : new mongoose.Types.ObjectId(),
    description:"MongoDB",
    startHour:11,
    startMin:0,
    endHour:16,
    endMin:0,
    dateOfMeeting:"16/08/2020",
    creator:userOneId,
    emails:["tonysoprano@gmail.com"]
}


const meeting2 = {
    _id : new mongoose.Types.ObjectId(),
    description:"HTML",
    startHour:12,
    startMin:30,
    endHour:18,
    endMin:30,
    dateOfMeeting:"16/08/2020",
    creator:userOneId,
    emails:["tonysoprano@gmail.com", "tonysopranojr@gmail.com"]
}

const meeting3 = {
    _id : new mongoose.Types.ObjectId(),
    description:"React",
    startHour:14,
    startMin:30,
    endHour:18,
    endMin:30,
    dateOfMeeting:"16/08/2020",
    creator:userTwoId,
    emails:["tonysopranojr@gmail.com"]
}

const setupDatabase = async ()=>{
    await User.deleteMany({});
    await Meeting.deleteMany({});
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Meeting(meeting1).save();
    await new Meeting(meeting2).save();
    await new Meeting(meeting3).save();
}

module.exports = {userOneId, userOne, setupDatabase,meeting1, meeting2, meeting3, userTwoId, userTwo}