const agencyModel = require('../model/agencySchema')
const bookingModel = require('../model/bookingSchema')
const tripModel = require('../model/tripSchema')
const bcrypt = require('bcrypt')
const authToken = require('../middleware/userAuth')

const signUp = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body
    const findAgency = await agencyModel.find({ email: email })
    if (findAgency.length === 0) {
      const hash = await bcrypt.hash(password, 10)
      console.log('signu');
      agencyModel.create({
        name: name,
        email: email,
        phone: phone,
        password: hash
      })

      res.json({ status: true });
    } else {
      return res.json({ error: "User already exists" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const login = async (req, res, next) => {
  let agentLogin = {
    status: false,
    message: null,
    token: null,
    name: null
  }
  try {
    console.log('login start 1 ');
    const { email, password } = req.body
    const agency = await agencyModel.findOne({ email: email })
    console.log('login part 2', agency);

    if (agency) {
      console.log('user findddd success');
      const isMatch = await bcrypt.compare(password, agency.password)
      // if (agency.isApproved === 0) {
        if (isMatch) {
          console.log('passwd');
          const Token = authToken.generateAgencyToken(agency)
          agentLogin.status = true
          agentLogin.message = 'logged in'
          agentLogin.token = Token
          agentLogin.name = agency.name

          res.send({ agentLogin });
        } else {
          agentLogin.message = 'wrong password'
          res.send({ agentLogin });
        }
      // }
      //  else {
      //   agentLogin.message = 'You were not Approved'
      //   res.send({ agentLogin })
      // }



    } else {
      agentLogin.message = 'Account does not exist'
      res.send({ agentLogin });
    }
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
}

const agentDetails=async(req,res)=>{
  try {
    const id = req.user._id
    const agencyData=await agencyModel.findOne({_id:id},{_id:0,image:1,isApproved:1})
    res.json({status: 'success', agencyData });
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
}

const agencyRegister=async(req,res)=>{
  try {
    const id = req.user._id
    const {name,regNo,city,state,pin,photo}=req.body
    const update=await agencyModel.updateOne(
      {_id:id},
      {$set:{
        agentName:name,
        regNumber:regNo,
        city:city,
        state:state,
        pin:pin,
        image:photo,
        isApproved:1

      }})
      res.json({ status: "success",message:'verification details will be informed' });
  } catch (error) {
    res.json({ status: 'failed', message: error.message })
  }
}

const getProfile = async (req, res) => {
  try {
    const agency = req.user._id
    const profile = await agencyModel.findOne({ _id: agency })
    res.json({ status: 'success', profile })

  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
}


const getDashboard = async (req, res) => {
  try {
    
    const id = req.user._id
    const agency = await agencyModel.findOne({ _id: id })
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
                }, {
                  agency: agency._id
                }
                ,{
                  isCanceled:0
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
              _id: "$agency",
              totalBookings: { $sum: 1 },
              totalRevenue: { $sum: '$advance' },


            },
          },
          {
            $project: {
              _id: 0,
              agency: "$_id",
              totalBookings: 1,
              totalRevenue: 1,
            },
          },
        ]);




        const tripData1 = await tripModel.aggregate([
          {
            $match: {
              $and: [
                {
                  date: {
                    $gte: new Date(date.year, date.month, 1),
                    $lt: new Date(date.year, date.month + 1, 1),
                  }
                }, {
                  agency: agency._id
                }
                // ,{
                //   isCanceled:0
                // }
              ]
              // date: {
              //   $gte: new Date(date.year, date.month, 1),
              //   $lt: new Date(date.year, date.month + 1, 1),
              // }

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
    console.error(error);
    res.status(500).json({ status: "failed", error: error.message })
  }
}

const dailydata = async (req, res) => {
  console.log('********');
  try {
    
    const id = req.user._id
    const agency = await agencyModel.findOne({ _id: id })
    const { year, month } = req.params; // Extract year and month from request parameters
    const startOfMonth = new Date(year, month - 1, 1); // Adjust month (0-based index)
    const endOfMonth = new Date(year, month, 0);

    // Define an array to store daily data
    const dailyData = [];

    // Loop through each day of the month
    for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
      // Find trips scheduled for the current day
      const tripsForDay = await tripModel.find({
        $and: [{
          date: {
            $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
            $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
          },
        }, {
          agency: agency._id
        }]

      });

      // Calculate total trips for the day
      const totalTrips = tripsForDay.length;

      // Find bookings for the current day
      const bookingsForDay = await bookingModel.find({
        
        $and:[
          {bookedDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
            $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
          },},{
            agency: agency._id
          }

        ]
      });

      // Calculate total bookings and revenue for the day
      const totalBookings = bookingsForDay.length;
      const totalRevenue = bookingsForDay.reduce((total, booking) => total + booking.advance, 0) / 1000;

      dailyData.push({
        date: date.toISOString(), // Convert the date to ISO format or any format you prefer
        totalTrips,
        totalBookings,
        totalRevenue,
      });
    }

    res.status(200).json(dailyData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports = {
  signUp, login,agencyRegister,agentDetails,
  getProfile,
  getDashboard, dailydata
}