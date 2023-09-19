const mongoose = require('mongoose')

const agencySchema = new mongoose.Schema({
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
    phone: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: [6],
    },
    image: {
        type: String,
    },


    agentName: {
        type: String,

        trim: true,
    },
    regNumber: {
        type: String,
        trim: true,
    },
    
    isApproved: {
        type: Number,
        default: 0
    },

    isBanned: { type: Boolean, default: false },
})



const agencyModel = mongoose.model('agency', agencySchema)
module.exports = agencyModel