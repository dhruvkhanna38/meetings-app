const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Enter a valid Email")
            }
        },
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        require:true,
        trim:true, 
        minlength :7 ,
        validate(value){
            const flag = value.toLowerCase().includes('password');
            if(flag){
                throw new Error("Password cannot contain the word password")
            }
        }
    },
    age:{
        type:Number,
        validate(value){
            if(value < 0){
                throw new Error("Age Cannot be Negetive")
            }
        },
        default:0
    },
    tokens:[{
        token:{type:String , required:true}
    }],
    avatar:{
        type: Buffer
    },
    profileImage:{
        type:Buffer
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    emailToken :{
        type:String
    }
},{timestamps:true})

userSchema.index({ email: 1 }, { unique: true});

userSchema.virtual('meetings' , {
    ref : 'Meeting',
    localField:  '_id',
    foreignField: 'creator'
});


userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error("Unable to Login");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    const isMatch2 = (password === user.password);
    
    if(!isMatch){
        throw new Error("Unable to Login");
    }
    return user;
}


userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()} , process.env.JWT_SECRET);
    user.tokens  = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.methods.getPublicProfile = function(){
    const user = this;
    const userObject =  user.toObject();
    delete userObject.password;
    
    return userObject;
}

userSchema.pre('save'  , async function(next){

    const user  =  this;
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8);
    }
    console.log("before saving");
    next();
});

const User = mongoose.model('User' , userSchema)

module.exports = User;