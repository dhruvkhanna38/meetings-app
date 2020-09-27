const mongoose = require("mongoose");
const validator = require("validator");

const meetingSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    startHour:{
        type:Number,
        required:true,
        min :0 , 
        max: 23
    },
    startMin : {
        type:Number,
        required:true,
        min :0 , 
        max: 59
    },
    endHour:{
        type:Number,
        required:true,
        min :0 , 
        max: 23

    },
    endMin:{
        type:Number,
        required:true,
        min :0 , 
        max: 59

    },
    dateOfMeeting:{
        type : String,
        required:true,
        trim :true , 
        validate(value){
            const flag = validator.isDate(value , 'DD/MM/YYYY')
            if(!flag){
                throw new Error("Enter a valid Date");
            }
        }
    },
    emails:[
        {
        type:String,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Enter a valid Email")
            }
        },
        trim:true,
        lowercase:true
        }
    ],
    creator:{
        type: mongoose.Schema.Types.ObjectId, 
        required:true,
        ref:'User'
    }
},{timestamps:true})

const Meeting = mongoose.model('Meeting', meetingSchema);




module.exports = Meeting;