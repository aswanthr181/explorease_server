const mongoose=require('mongoose')
require('dotenv').config()
module.exports.connectDb=()=>{
    mongoose.connect('mongodb+srv://aswanthr:Aswr200018@cluster0.vxuzs9l.mongodb.net/EXPLOREASE', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(()=>{
    console.log('database connected');
  }).catch((err)=>{
    console.log(err+"database didn't connected");
  })
}