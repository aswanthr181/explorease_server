const bannerModel=require('../model/bannerSchema')
const cloudinary=require('../config/cloudinary');
const fs=require('fs')

const BannerAdd = async (req, res) => {
    const data = req.body;
    const title = req.body.title;
    const subTitle = req.body.subTitle;
    const file = req.file;
    let img;
    try {
      if (file) {
        const upload = await cloudinary.cloudinary.uploader.upload(file?.path);
        img = upload.secure_url;
        fs.unlinkSync(file.path);
  
        const newBanner = new bannerModel({
          title,
          subTitle,
          image:img,
        });
        const savedBanner = await newBanner.save();
        res.status(200).json({ status: true, banner: savedBanner });
      }
    } catch (error) {
      res.status(500).json({ status: "failed", message: error.message });
    }
  };
  
  const getBanner = async (req, res) => {
    try {
      const data = await bannerModel.find().sort({ _id: -1 });
      res.status(200).json({ banner: data});
    } catch (error) {
      res.status(500).json({ status: "failed", message: error.message });
    }
  };
  
  const removeBanner = async (req, res) => {
    const {id } = req.body;
  
    try {
      const banner = await bannerModel.deleteOne({_id:id});
      if (!banner) {
        return res.status(404).json({ status: false, message: "Club not found" });
      }
      const resend = await bannerModel.find();
      res.status(200).json({
        status: true,
        banner: resend,
        message: "Banner removed successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "An error occurred while removing the banner",
      });
    }
  };
  
  const allDetails=async(req,res)=>{
    try {
      const users=await userModel.find()
      const turves=await turfModel.find()
      const clubs=await clubModel.find()
      const tournaments=await tournamentModel.find()
  
      res.status(200).json({
        userCount: users.length,
        turfCount: turves.length,
        clubCount: clubs.length,
        tournamentCount: tournaments.length,
      });
      
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "An error occurred while getting all details",
      });
    }
  }

  module.exports={
    BannerAdd,getBanner,removeBanner,allDetails
  }