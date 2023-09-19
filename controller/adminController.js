const adminModel = require('../model/adminSchema')
const userModel = require('../model/userSchema')
const agencyModel = require('../model/agencySchema')
const tripModel = require('../model/tripSchema')
const bookingModel=require('../model/bookingSchema')
const bannerModel = require('../model/bannerSchema')
const authToken = require('../middleware/userAuth')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')


const dashboardDetails = async (req, res) => {
    try {

        const users = await userModel.find({})
        const agency = await agencyModel.find({})
        const trips = await tripModel.find({})

        // details.user=users.length
        // details.agency=agency.length
        // details.trips=trips.length
        let details = {
            userCount: users.length,
            agencyCount: agency.length,
            tripCount: trips.length
        }

       



        res.json({ details });
    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}

const adminLogin = async (req, res) => {
    try {
        let result = {
            status: false,
            message: '',
            token: null
        };
        const { email, password } = req.body
        const admin = await adminModel.findOne({ email: email })
        if (admin) {
            const passwordMatch = await bcrypt.compare(password, admin.password)
            if (passwordMatch) {
                const token = authToken.generateAdminToken(admin)
                result.status = true;
                result.token = token
                res.json({ result });
            } else {
                result.message = "Wrong Password";
                res.json({ result });
            }
        } else {
            result.message = "Wrong email";
            res.json({ result });
        }
    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}

const userList = async (req, res) => {
    try {
        const user = await userModel.find({})
        res.json({ status: "success", result: user });
    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}

const blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        const data = await userModel.find({ _id: id })
        if (data[0].isBanned === true) {
            await userModel.updateOne({ _id: id }, { $set: { isBanned: false } });
        } else {
            await userModel.updateOne({ _id: id }, { $set: { isBanned: true } });
        }
        let resend = await userModel.find({});
        res.json({ result: resend, message: "success" });
    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}

const blockAgency = async (req, res) => {
    try {
        const id = req.query.id;
        const data = await agencyModel.find({ _id: id })
        if (data[0].isBanned === true) {
            await agencyModel.updateOne({ _id: id }, { $set: { isBanned: false } });
        } else {
            await agencyModel.updateOne({ _id: id }, { $set: { isBanned: true } });
        }
        const resend = await agencyModel.find({})
        res.json({ result: resend, message: "success" });
    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}

const agencyList = async (req, res) => {
    try {
        const agency = await agencyModel.find({ isApproved: 1 })
        res.json({ status: "success", result: agency });
    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}

const pendingAgencyList = async (req, res) => {
    try {
        console.log('hlolololo');
        const agency = await agencyModel.find({ isApproved: 0 })
        res.json({ status: "success", result: agency });
    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}
const sendResponseMail = async (name, email, user_id, check) => {
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
                subject: "Registration Approval",
                html: `<p>Hi ${name}, Your Application for Registration with ${email} has been approved.
                         Log in to site to explore ExploreEase </p>`,

            };
            transporter.sendMail(mailOption, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email has been sent:-", info.response);
                }
            });
        } else {
            const mailOption = {
                from: "traveliaexplore@gmail.com",
                to: email,
                subject: "Registration Rejected",
                html: `<p>Hi ${name}, Your Application for Registration with ${email} has been Rejected.
                          </p>`,

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
const approveAgency = async (req, res) => {
    try {
        const id = req.query.id;
        const update = await agencyModel.updateOne({ _id: id }, { $set: { isApproved: 1 } });

        if (update) {
            const agency = await agencyModel.findOne({ _id: id })
            sendResponseMail(agency.name, agency.email, agency._id, true)
            const agency1 = await agencyModel.find({ isApproved: 0 })
            res.json({ result: agency1, message: "success", status: true });

        }

    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}
const rejectAgency = async (req, res) => {
    try {
        const id = req.query.id;
        const update = await agencyModel.updateOne({ _id: id }, { $set: { isApproved: -1 } });
        const agency = await agencyModel.findOne({ _id: id })
        sendResponseMail(agency.name, agency.email, agency._id, false)
        const agency1 = await agencyModel.find({ isApproved: 0 })
        res.json({ result: agency1, message: "success", status: true });

    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}

const salesDash=async(req,res)=>{
    try {
        const today = new Date();
        const currentDate = new Date();
        currentDate.setMonth(today.getMonth() - 6);
        const lastSixMonths = new Array(12).fill(0).map((_, index) => {

            const month = (currentDate.getMonth() + index) % 12;
            const year = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + index) / 12);
            return {
                month: month === -1 ? 11 : month, // Adjust for December (month 11)
                year: month === -1 ? year - 1 : year,
            };
        });

        const monthlyData = await Promise.all(
            lastSixMonths.map(async (date) => {
                // Aggregate total bookings and revenue for each month

                const bookingData = await bookingModel.aggregate([
                    {
                        $match: {
                            $and: [
                                {
                                    bookedDate: {
                                        $gte: new Date(date.year, date.month, 1),
                                        $lt: new Date(date.year, date.month + 1, 1),
                                    }
                                }
                                , {
                                    isCanceled: 0
                                }
                            ]
                            // bookedDate: {
                            //   $gte: new Date(date.year, date.month, 1),
                            //   $lt: new Date(date.year, date.month + 1, 1),
                            // }
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalBookings: { $sum: 1 },
                            totalRevenue: { $sum: '$advance' },


                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            
                            totalBookings: 1,
                            totalRevenue: 1,
                        },
                    },
                ]);




                const tripData1 = await tripModel.aggregate([
                    {
                        $match: {

                            date: {
                                $gte: new Date(date.year, date.month, 1),
                                $lt: new Date(date.year, date.month + 1, 1),
                            }

                        },
                    },
                    {
                        $group: {
                            _id: "$agency",
                            totalTrips: { $sum: 1 },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            agency: "$_id",
                            totalTrips: 1,
                        },
                    },
                ]);
                console.log(tripData1, '454545');
                const tripData = tripData1

                return {
                    year: date.year,
                    month: date.month,
                    totalBookings: bookingData.length ? bookingData[0].totalBookings : 0,
                    totalRevenue: bookingData.length ? bookingData[0].totalRevenue / 1000 : 0,
                    totalTrips: tripData.length ? tripData[0].totalTrips : 0,
                };
            })
        );
        res.json(monthlyData);
    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}

module.exports = {
    dashboardDetails,
    adminLogin,
    userList, blockUser,
    agencyList, blockAgency,
    pendingAgencyList, approveAgency, rejectAgency,
    salesDash
}