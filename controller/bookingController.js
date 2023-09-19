const bookingModel = require('../model/bookingSchema')
const tripModel = require('../model/tripSchema')
const transactionModel=require('../model/transactionSchema')
const Stripe = require('stripe');
require("dotenv").config();
const mongoose = require('mongoose')

const stripe = Stripe(process.env.STRIPE_KEY)

const checkOut = async (req, res) => {
    try {
        console.log('payment satat');
        const { id,  passengers, ages ,genders} = req.body
        console.log('req details',id,  passengers, ages);
        const data = await tripModel.findOne({ _id: id })
        
        console.log('payment dataaa', data);
        console.log('middleware ', req.user._id);

        const user = await stripe.customers.create({
            metadata: {
                userId: req.user._id,
                agencyId: data.agency,
                tripId: data._id,
                advance: data.advance,
                date: data.date,
                totalAmount: data.amount,
            },
        });

        const session = await stripe.checkout.sessions.create({
            customer: user.id,
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: data.title,
                            metadata: {
                                id: data._id,
                            },
                        },
                        unit_amount: data.advance * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.CLIENT_URL
                }/booking-success?amount=${encodeURIComponent(
                    data.amount
                )}&advance=${encodeURIComponent(
                    data.advance
                )}&tripId=${encodeURIComponent(data._id)}&date=${encodeURIComponent(
                    data.date
                )}`,
            cancel_url: `${process.env.CLIENT_URL}/paymentFail`,
        });

        paymentSuccess(req.user._id, data._id,data.agency, data.advance, data.amount,passengers, ages,genders)
        res.send({ url: session.url });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ error: "Failed to create payment intent" });
    }
}

const paymentSuccess = async (userId, tripId,agency, advance, amount,passengers, ages,genders) => {
    try {
        // const details = req.body
        const people=passengers.length
        console.log('after payment done success    **', people);

        const now = new Date()
        // const userId= req.user._id
        const booking = await bookingModel.create({
            user: userId,
            trip: tripId,
            agency:agency,
            advance: advance,
            pending: amount - advance,
            bookedDate: now,
            userNumber: people,
            maxPeoples: people
        })
        console.log(booking, 'success');

        for (let i = 0; i < passengers.length; i++) {
            await bookingModel.findOneAndUpdate(
                { _id:booking._id },
                {
                    $push: {
                        passengers: { name: passengers[i], age: ages[i] }
                    }
                },
                { new: true }
            )
        }
        const transaction=await transactionModel.create({
            user: userId,
            trip: tripId,
            agency:agency,
            amount:advance,
            date:now,
            paymentMethod:'withdraw',
            paymentMode:'stripe'
        })
        console.log('addddd passengrs success');
        const updatedTrip = await tripModel.findByIdAndUpdate(
            { _id: tripId },
            { $inc: { peoples: -people } }, // Decrement the 'peoples' field
            { new: true } // Return the updated document
        );

    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ error: "Failed to create payment intent" });
    }
}

const getTripDetails = async (req, res) => {
    try {

        const id = req.query.id

        // const tripData = await bookingModel.find({ trip: id }).populate('user').populate('trip')
        const tripData = await tripModel.findOne({ _id: id })
        const bookings = await bookingModel.find({ trip: id }).populate('user')

        console.log('going for sum');
        // const result = await bookingModel.aggregate([
        //     {
        //       $group: {
        //         _id: null, // Group by null to calculate the total across all documents
        //         totalUserNumber: { $sum: '$userNumber' }, // Calculate the sum of 'userNumber' field
        //       },
        //     },
        //   ]);
        //   console.log(result,'summm');
        const totalUserNumber = 2
        // console.log(totalUserNumber);
        if (tripData) {
            res.status(200).json({ data: tripData, bookings, totalUserNumber })
        } else {
            res.status(500).json({ error: 'no data' })
        }
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
}

const book = async (req, res) => {
    try {
        console.log('hey booking startredecece', req.query._id);
        const userId = req.query._id
        const { id, passengers, ages } = req.body
        const now = new Date()
        // const userId= req.user._id
        const booking = await bookingModel.create({
            user: '64fb4148591850af9e833582',
            trip: id,
            advance: 1000,
            pending: 12000,
            bookedDate: now,
            userNumber: 50,
            maxPeoples: 50
        })

        console.log('book dom');

        for (let i = 0; i < passengers.length; i++) {
            await bookingModel.findOneAndUpdate(
                { trip: id },
                {
                    $push: {
                        passengers: { name: passengers[i], age: ages[i] }
                    }
                },
                { new: true }
            )
        }

        res.status(200).json({ result: 'true' })
    } catch (error) {
        console.error('Error in bookingPage:', error.message);
        res.json({ status: 'failed', message: error.message })
    }

}


module.exports = {
    checkOut,
    paymentSuccess, getTripDetails, book
}