const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const base64url = require('base64url')
const userModel = require('../model/userSchema')
const tripModel = require('../model/tripSchema')
const bookingModel = require('../model/bookingSchema')
const transactioModel = require('../model/transactionSchema')
const authToken = require('../middleware/userAuth')
const nodemailer = require('nodemailer')

const adminModel = require('../model/adminSchema')


const googlelogin = async (req, res, next) => {
    try {
        const payloadDetails = req.body

        let userSignUp = {
            Status: false,
            message: null,
            token: null,
            name: null,
        }

        console.log(payloadDetails.name);
        const user = await userModel.findOne({ email: payloadDetails.email })

        if (!user) {
            userModel.create({
                name: payloadDetails.name,
                email: payloadDetails.email,
                isVerified: true,
                isGoogleSign: true
            })
            const newUser = await userModel.findOne({ email: payloadDetails.email })
            console.log(newUser);
            const token = authToken.generateAuthToken(newUser)

            userSignUp.Status = true,
                userSignUp.message = 'you are logged in',
                userSignUp.token = token,
                userSignUp.name = newUser.name

            res.json({ Success: true, userSignUp,user:newUser })
        } else if (user.isGoogleSign === true) {
            const token = authToken.generateAuthToken(user)

            userSignUp.Status = true,
                userSignUp.message = 'you are logged in',
                userSignUp.token = token,
                userSignUp.name = user.name

            res.json({ Success: true, userSignUp,user })
        } else if (user.isGoogleSign === false) {
            userSignUp.message = 'please log in using userDetails'
            res.json({ Success: false, userSignUp })
        } else {
            userSignUp.message = 'error occured please chech email'
            res.json({ Success: false, userSignUp })
        }



    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const sendVerifyMail = async (name, email, user_id, check) => {
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
        const secretKey = 't9rXw5bF2mS7zQ8p';
        const encoded = base64url.encode(user_id);
        const token = jwt.sign({ user_id }, secretKey, { expiresIn: '1h' });
        const encodedToken = encodeURIComponent(token)
        console.log(encodedToken, '*********');
        if (check === true) {
            const mailOption = {
                from: "traveliaexplore@gmail.com",
                to: email,
                subject: "To verify your mail",
                html: `<p>Hii ${name}, Please click here to <a href="https://www.explorease.site/verify/${encoded}">Verify</a> your mail to explore the explorease</p>`,
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
                subject: "To verify your mail",
                html: `<p>Hii ${name}, Please click here to <a href="https://www.explorease.site/verify/${user_id}">Verify</a> your mail</p>`,
            };
            transporter.sendMail(mailOption, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email has been sent:-", info.response);
                }
            })

        }
    } catch (error) {
        console.log(error + "haaai");
    }
};

const verifyMail = async (req, res) => {
    try {
        let encoded = req.body.token;
        console.log(encoded)

        const decoded = base64url.decode(encoded);
        console.log(decoded, '---------------');
        const user_id = decoded.user_id;
        console.log();
        const updateInfo = await userModel.updateOne(
            { _id: decoded },
            { $set: { isVerified: 1 } }
        );
        res.json({ status: true });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

const signUp = async (req, res, next) => {
    try {
        let userData = req.body
        const findUser = await userModel.find({ email: userData.email })
        const findNumber = await userModel.find({ mobile: userData.mobile })
        console.log(findUser.length, findNumber.length);

        if (findUser.length === 0 && findNumber.length === 0) {
            userData.password = await bcrypt.hash(userData.password, 10)
            userModel.create({
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                password: userData.password,
                isGoogleSign: false
            }).then((data) => {
                console.log(data);
            }).catch((error) => {
                console.log(error)
            })

            // adminModel.create({

            //     email: userData.email,

            //     password: userData.password
            // })

            const newUser = await userModel.findOne({ email: userData.email })
            console.log('send verigy mllll');

            if (newUser) {
                const emails = await sendVerifyMail(newUser.name, newUser.email, newUser._id, true)
                console.log(emails, '-------');
                res.json({ status: true, result: userData });
            }
            res.json({ status: false, result: userData, message: 'error occured for sending mail' });


        } else {
            return res.json({ error: "User already exists with user credential" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

const login = async (req, res, next) => {
    let userLogin = {
        Status: false,
        message: null,
        token: null,
        name: null
    }
    try {

        const { email, password } = req.body
        const user = await userModel.findOne({ email: email })
        if (user) {
            console.log(user);
            if (user.isGoogleSign === true) {
                userLogin.message = 'please sign in using google'
                res.send({ userLogin })
            } else {
                const isMatch = await bcrypt.compare(password, user.password)
                if (!user.isBanned) {
                    if (isMatch) {
                        if (user.isVerified === 1) {
                            const token = authToken.generateAuthToken(user)
                            console.log(token);
                            userLogin.message = 'you are logged'
                            userLogin.Status = true
                            userLogin.token = token
                            userLogin.name = user.name
                            console.log('first')

                            res.send({ userLogin, user });
                        } else {
                            userLogin.message = 'email not verified Please check your email to Login'
                            res.send({ userLogin })
                        }



                    } else {
                        userLogin.message = 'wrong password'
                        res.send({ userLogin })
                    }
                } else {
                    userLogin.message = 'Your Account Has been Blocked'
                    res.send({ userLogin })
                }

            }

        }
        else {
            userLogin.message = 'Email does not exists'
            res.send({ userLogin })
        }
    } catch (error) {
        res.json({ status: "failed", message: error.message });

    }

}
const userProfile = async (req, res, next) => {
    try {
        console.log("user profile page***");
        const id = req.user;
        let userDetails = await userModel.findOne({ _id: id._id })

        if (userDetails) {
            res.status(200).json({ data: userDetails });
        } else {

            res.status(500).send({ error: "no user" });
        }
    } catch (error) {
        res.json({ status: "failed", message: error.message });
    }
}

const getDetails = async (req, res, next) => {
    try {

    } catch (error) {

    }
}

const userEdit = async (req, res, next) => {
    try {
        const data = req.body
        const id = req.user._id
        const phone = await userModel.find({ mobile: data.phone })
        if (phone.length > 0) {
            res.json({ status: "failed" });
        } else {
            const update = await userModel.updateOne({ _id: id }, { $set: { name: data.name, mobile: data.phone, image: data.photo } })
            res.json({ status: "success" });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ status: "failed", message: error.message });
    }
}

const tripList = async (req, res, next) => {
    try {
        const trips = await tripModel.find({})
        res.json({ Status: "success", result: trips })
    } catch (error) {
        console.log(error.message);
        res.json({ status: "failed", message: error.message });
    }
}

const tripDetails = async (req, res, next) => {
    try {
        const id = req.query.id
        const tripData = await tripModel.findOne({ _id: id })

        if (tripData) {
            res.status(200).json({ data: tripData })
        } else {
            res.status(500).json({ error: 'no data' })
        }
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
}

const bookingHistory = async (req, res) => {
    try {
        const id = req.user;
        const booking = await bookingModel.find({ user: id._id }).populate('trip')

        res.status(200).json({ data: booking });
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
}

const cancelBooking = async (req, res) => {
    try {
        const id = req.user._id;
        const bookingId = req.query.id
        const update = await bookingModel.updateOne({ _id: bookingId }, { $set: { isCanceled: 1 } })
        const booking1 = await bookingModel.findOne({ _id: bookingId })
        const booking2 = await bookingModel.findOne({ _id: bookingId }).populate('trip')
        const booking = await bookingModel.find({ user: id }).populate('trip')
        const updatedUser = await userModel.findByIdAndUpdate(
            { _id: id },
            { $inc: { wallet: booking1.advance * 0.8 } }, // Increment the 'wallet' field by the specified amount
            { new: true } // Return the updated document
        );
        const now = new Date()
        const transaction = await transactioModel.create({
            user: id,
            trip: booking1.trip,
            agency: booking2.trip.agency,
            amount: booking1.advance * 0.8,
            date: now,
            paymentMethod: 'credited',
            paymentMode: 'wallet'
        })
        const increseSeat = await tripModel.findOneAndUpdate(
            { _id: booking2.trip._id },
            { $inc: { peoples: booking1.passengers.length } }, { new: true }
        );

        res.json({ status: "success", data: booking });
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
}

const getBooingDetails = async (req, res) => {
    try {

        const id = req.query.id

        const details = await bookingModel.findOne({ _id: id }).populate('trip')
        res.json({ status: "success", data: details });
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
}

const transactions = async (req, res) => {
    try {
        const id = req.user._id;
        const trans = await transactioModel.find({ user: id })
        res.json({ status: "success", trans });
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
}

// const getwallet=async(req,res)=>{
//     try {
//         const id = req.user._id;
//         const 
//     } catch (error) {

//     }
// }


module.exports = {
    signUp, login,
    sendVerifyMail, verifyMail, googlelogin,
    userProfile, getDetails, userEdit,
    tripList, tripDetails,
    bookingHistory, cancelBooking, getBooingDetails,
    transactions

}