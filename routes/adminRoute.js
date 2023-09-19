const express=require('express')
const router=express.Router()

const auth= require('../middleware/userAuth')
const adminController=require('../controller/adminController')
const bannerController=require('../controller/bannerController')
const multer=require('../config/multer')
const upload=multer.createMulter()

router.post('/login',adminController.adminLogin)
router.get('/getDashBoard',auth.verifyAdminToken,adminController.dashboardDetails)
router.get('/userList',auth.verifyAdminToken,adminController.userList)
router.patch('/blockUser',auth.verifyAdminToken,adminController.blockUser)
router.get('/getAgency',auth.verifyAdminToken,adminController.agencyList)
router.patch('/blockAgency',auth.verifyAdminToken,adminController.blockAgency)
router.get('/getPending',auth.verifyAdminToken,adminController.pendingAgencyList)
router.get('/approve',auth.verifyAdminToken,adminController.approveAgency)
router.post('/rejectRequest',auth.verifyAdminToken,adminController.rejectAgency)

router.post('/bannerAdd',upload.single('file'),auth.verifyAdminToken,bannerController.BannerAdd)
router.get('/getBanner',auth.verifyAdminToken,bannerController.getBanner)
router.post('/removeBanner',auth.verifyAdminToken,bannerController.removeBanner)

router.get('/sales-report',auth.verifyAdminToken,adminController.salesDash)

module.exports=router