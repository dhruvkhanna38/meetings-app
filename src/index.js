const express = require("express");
const cors = require('cors');
const app = express();
require("./db/mongoose");
const User = require("./models/user");
const Meeting = require("./models/meeting");
const userRouter = require("./routers/user.js");
const meetingRouter = require("./routers/meeting");
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");

// const multer = require("multer");
// const upload  = multer({
//     dest:'images',
//     limits:{
//         fileSize: 2000000
//     },
//     fileFilter(req, file ,callback){
//         if(!file.originalname.match(/\.(doc|docx)$/)){
//             return callback(new Error("Please upload a word doc"))
//         }
//         callback(undefined, true)
//     }
// })

// app.post('/upload', upload.single('upload'),  (req, res)=>{
//     res.send();
// })



app.use(cors());

const PORT = process.env.PORT

//middleware
// app.use((req, res, next)=>{
//     if(req.method === 'GET'){
//         res.send("Get req are diabled");
//     }else{
//         next();
//     }
    
// })

// app.use((req, res, next)=>{
//     res.status(503).send("Maintenence Mode")
// })
app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.set('view engine', 'ejs');


app.use(userRouter);
app.use(meetingRouter);


app.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}`);
})

//const bcrypt = require("bcryptjs");

// const myFunction  = async ()=>{
//     const password = "harry123";
//     const hashedPassword  = await bcrypt.hash(password, 8)
//     console.log(password, ";", hashedPassword);
//     const isMatch = await bcrypt.compare("harry123" , hashedPassword);
//     console.log(isMatch);
// }

// myFunction();

// const jwt = require("jsonwebtoken");

// const myFunction = ()=>{
//     const token = jwt.sign({_id:'abc123'}, 'Harry', {expiresIn:'7 days'});
//     console.log(token);
//     const data = jwt.verify(token, "Harry");
//     console.log(data);
// }

// myFunction()

// const main= async ()=>{
//     const meeting = await Meeting.findById("5f5e60862af394995d124512")
//     await meeting.populate('creator').execPopulate()
//     console.log(meeting);
//     const user = await User.findById("5f5ded2d926ba58d75390f08");
//     await user.populate('meetings').execPopulate()
//     console.log(user.meetings);
// }
// main()