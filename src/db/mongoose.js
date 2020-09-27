const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL , {
    useNewUrlParser:true , 
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
});



// const me = new User({
//     name:"Hermione Granger", 
//     age:21,
//     email:"HermioneGranger@hogwartz.edu.in",
//     password:"password" 
// })

// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{console.log(error)});

// const meeting = new Meeting({
//     description:"Mongodb" , 
//     startHour:10,
//     startMin:0,
//     endHour:12, 
//     endMin:0,
//     emails:["hermionegranger@hogwartz.edu.in" , "ronweasly@gmail.com"],
//     dateOfMeeting: new Date()
// })

// meeting.save().then(()=>{
//     console.log(meeting)
// }).catch((error)=>{console.log(error)})