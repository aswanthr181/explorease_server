const tripModel = require('../model/tripSchema')
const bookingModel=require('../model/bookingSchema')
const userModel=require('../model/userSchema')

const tripRegistration = async (req, res) => {
    try {
        const agency = req.user._id
        const { title, start, destination, date, peoples,
            day, night, amount, advance, description, photo, fromLongitude, fromLatitude,
            toLongitude, toLatitude } = req.body

        const data = await tripModel.create({
            agency: agency,
            title: title,
            start: { place: start, longitude: fromLongitude, latitude: fromLatitude },
            destination: { place: destination, longitude: toLongitude, latitude: toLatitude },
            date: date,
            maxPeoples: peoples,
            peoples: peoples,
            day: day,
            night: night,
            amount: amount,
            advance: advance,
            description: description,
            photo: photo
        })
        res.json({ status: true, id: data._id, message: "trip registered" });
    } catch (error) {
        console.error('Error in tripRegistration:', error.message);
        res.status(500).json({ error: error.message });
    }
}

const addItenary = async (req, res) => {
    try {
        const { interpoint, description, tripId } = req.body
        const updatedTrip = await tripModel.findOneAndUpdate(
            { _id: tripId }, // Find the trip by its ObjectId
            {
                $push: {
                    itinerary: { destination: interpoint, description },
                },
            },
            { new: true } // This option will return the updated document
        );
        const trip=await tripModel.findOne({_id:tripId})
        if(trip.day==trip.itinerary.length){
            await tripModel.updateOne({ _id: tripId }, { $set: { confirm: true } })
        }
        if (!updatedTrip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json({ success: true, updatedTrip });

    } catch (error) {

        res.status(500).json({ error: 'Internal server error' });
    }
}

const tripList = async (req, res) => {
    try {
        const agency = req.user._id
        const trips = await tripModel.find({ agency: agency })
        res.json({ status: 'success', result: trips })

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

const sendRefundMail = async (booking,check) => {
    console.log('refunfdddddddddddddddd');
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "traveliaexplore@gmail.com",
                // pass: "xaypczevuzopytbt",
                pass: "subfeavfrhenmopo"

            },
        });

        if (check === true) {
            const mailOption = {
                from: "traveliaexplore@gmail.com",
                to: email,
                subject: "Trip Cancelled",
                html: `<p>Hi ${booking.user.name}, Your Booking with booking id ${booking._id} has been cancelled due to 
                         paid amount of ${booking.advance} will be refunded to your wallet </p>`,

            };
            transporter.sendMail(mailOption, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email has been sent:-", info.response);
                }
            });
        }
    } catch (error) {
        console.log(error + "haaai");
    }
};

const cancelTrip = async (req, res) => {
    try {
        const agency = req.user._id
        const id = req.query.id
        const update = await tripModel.updateOne({ _id: id }, { $set: { is_cancel: 1 } })
        const trips = await tripModel.find({ agency: agency })
        const bookings=await bookingModel.find({trip:id},{_id:0,user:1,advance:1,trip:1}).populate('trip')
        if(bookings.length>0){
            await refund(bookings)
        }
        res.json({ status: 'success', result: trips,users:bookings.length })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

const refund=async (bookings)=>{
    try {
        console.log('refeund stststststs',bookings);
        for(let i=0;i<bookings.length;i++){
            const user=await userModel.findOne({_id:bookings[i].user})
            console.log('usesrsrsrs',user.name);
            // if(bookings[i]._id){
            //     await sendRefundMail(bookings[i],user,true)
            // }
            await userModel.findByIdAndUpdate({_id:user._id},
                {$inc:{wallet: bookings[i].advance}})
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}



module.exports = {
    tripRegistration, addItenary,
    tripList, cancelTrip
}
