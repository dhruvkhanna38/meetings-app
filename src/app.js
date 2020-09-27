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


app.use(cors());


app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.set('view engine', 'ejs');


app.use(userRouter);
app.use(meetingRouter);


module.exports = app;