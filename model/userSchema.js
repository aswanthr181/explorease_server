const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    mobile: {
        type: Number,
        
    },
    password: {
        type: String,
        trim: true,
        
        minlength: [6],
    },
    image: {
        type: String,
        default:''
    },

    isVerified: {
       type:Number,
       default:0
    },

    wallet:{
        type:Number,
        default:0
    },
    isGoogleSign:{
        type: Boolean, 
    },



    isBanned: { type: Boolean, default: false },
})


const userModel=mongoose.model('users',userSchema)
module.exports=userModel