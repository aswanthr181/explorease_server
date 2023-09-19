const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users", 
        required: true 
    },
    agency: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "agency", 
        required: true 
    },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "trip", required: true },

    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    paymentMode: {
        type: String,
    },
    paymentMethod:{
        type:String
    }

})

const transactioModel=mongoose.model('transaction',transactionSchema)
module.exports=transactioModel