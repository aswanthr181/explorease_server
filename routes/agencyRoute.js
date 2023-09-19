const express=require('express')
const router=express.Router()
const agencyController=require('../controller/agencyController')
const tripController=require('../controller/tripController')
const chatController=require('../controller/chatController')
const bookingController=require('../controller/bookingController')
const auth=require('../middleware/userAuth')

router.post('/signup',agencyController.signUp)
router.post('/login',agencyController.login)
router.post('/resgister-trip',auth.verifyToken,tripController.tripRegistration)
router.post('/addIterate',tripController.addItenary)
router.get('/getourTrips',auth.verifyToken,tripController.tripList)
router.get('/getDetails',auth.verifyToken,bookingController.getTripDetails)
router.get('/loadList',auth.verifyToken,chatController.getUsers)
router.post('/addMessage',auth.verifyToken,chatController.addMessage)
router.get('/getprofile',auth.verifyToken,agencyController.getProfile)
router.patch('/cancelTrip',auth.verifyToken,tripController.cancelTrip)
router.get('/sales-report',auth.verifyToken,agencyController.getDashboard)
router.get('/dailySales-report/:year/:month',auth.verifyToken,agencyController.dailydata)

module.exports=router