const mongoose = require('mongoose')

const tripSchema = new mongoose.Schema({
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agency',
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    // start: {
    //     type: String,
    //     required: true,
    //     trim: true,
    // },
    start: [
        {
            place: {
                type: String,
                required: true,
                trim: true,
            },
            longitude: {
                type:Number,
                required:true
            },
            latitude: {
                type:Number,
                required:true
            }
        }
    ],
    destination: [
        {
            place: {
                type: String,
                required: true,
                trim: true,
            },
            longitude: {
                type:Number,
                required:true
            },
            latitude: {
                type:Number,
                required:true
            }
        }
    ],
    date: {
        type: Date,
        required: true,
        trim: true,
    },
    maxPeoples:{
        type: Number,
        required: true,
        trim: true,
    },
    peoples : {
        type: Number,
        required: true,
        trim: true,
    },
    day: {
        type: String,
        required: true,
        trim: true,
    },
    night: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: String,
        required: true,
        trim: true,
    },
    advance: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    photo: {
        type: String,
        default: ''
    },
    is_cancel: { type:Number, default:0 },
    confirm: { type: Boolean, default: false },
    

    itinerary: [
        {
            destination: {
                type: String,
                trim: true,
            },



            description: {
                type: String,
                trim: true,
            },
            

        }
    ]
})

const tripModel = mongoose.model('trip', tripSchema)
module.exports = tripModel