const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const socketIo = require('socket.io')
require('dotenv').config()
const { connectDb } = require("./config/dbConnection")

const userRouter = require('./routes/userRoute')
const agencyRouter = require('./routes/agencyRoute')
const adminRouter = require('./routes/adminRoute')

const app = express();
dotenv.config();

app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'))
app.use(cors())
app.use(express.static('public'))
app.use(cookieParser())

app.use('/', userRouter)
app.use('/agency', agencyRouter)
app.use('/admin', adminRouter)

const PORT = process.env.PORT;

// mongoose.connect('mongodb://127.0.0.1:27017/travel', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })

//   .then(() => {
//     app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
//   });
connectDb()
const server = app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

const io = socketIo(server, {
  cors: {
    origin: "*",
    Credential: true
  }
})

io.on('connection', (socket) => {
  socket.on('setup', (chatId) => {
    socket.join(chatId)
    socket.emit('connected')
    console.log('connected', chatId)
  })

  socket.on('newMessage',(message, chatId )=>{
    console.log('mEssage recieved', message, 'on ', chatId)
    io.emit('messageResponse', message, chatId)
    console.log('sended')
  })

  socket.on('disconnect', () => {
    console.log("Socket disconnected");
});
})

