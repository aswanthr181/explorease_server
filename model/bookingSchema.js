const mongoose = require('mongoose')
const tripModel = require('./tripSchema')

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "trip", required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: "agency", required: true },

    advance: { type: Number, required: true },
    pending: { type: Number, required: true },
    bookedDate: { type: Date, required: true },
    isCanceled: { type:Number, default:0 },
    paymentMethod: {type:String,default:'card'},
    userNumber: {type:Number,required:true},
    passengers: [
        {
           name: {
                type: String,
                trim: true,
            },



            age: {
                type: Number,
                trim: true,
            },
        }
    ]


})

const bookingModel = mongoose.model('bookings',bookingSchema)
module.exports = bookingModel