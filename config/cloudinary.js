const cloudinary = require('cloudinary').v2
// const env = require('dotenv').config()


cloudinary.config({
    //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    //   api_key: process.env.CLOUDINARY_API_KEY, 
    //   api_secret: process.env.CLOUDINARY_API_SECRET
    cloud_name: 'dvxowlkti',
    api_key: '154663498824595',
    api_secret: 'XsFBHCRCtUdx6EgtP6VoA5HY8Nk'
});


module.exports = { cloudinary }
