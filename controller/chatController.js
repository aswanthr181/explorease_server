const chatModel=require('../model/chatSchema')

const accessChatRoom = async(req,res)=>{
    try {
        console.log('create chat');
        const userId = req.user._id
        const reciepientId = req.body.id
        const chatType = req.body.chatType
        console.log(userId,reciepientId,'*+*+*+*+*+');
        const chat=await chatModel.findOne({
            $and: [
                { sender: userId || reciepientId },
                { receiver: reciepientId || userId }
            ]
        })
        console.log('chat ',chat);
        if(chat){
            console.log('chat exist');
            res.status(200).json({ chat })
        }else{
            console.log('chat not exist');
            const newChat=await chatModel.create({
                sender: userId,
                receiver: reciepientId,
                chatType,
            })

            const chat=await chatModel.findOne({_id: newChat._id})
            console.log('chat2 ',chat);
            res.status(200).json({ chat })
        }
        
    } catch (error) {
        res.status(500).json({ errMsg: 'Server error' })
    }
}

const addMessage = async(req,res)=>{
    try {
        const { message,chatId,sender } = req.body
        const senderId=req.user._id
        
        const updatedChat=await chatModel.updateOne({_id:chatId},
            {
                $push: {
                    messages: {
                        text: message,
                        senderType: sender,
                        user: senderId,
                    }
                }
            })
            
            if(updatedChat){
                const chat=await chatModel.findOne({_id: chatId})
                res.status(200).json({ chat })
            }
    } catch (error) {
        res.status(500).json({ errMsg: 'Server error' })
    }
}

const getUsers=async(req,res)=>{
    try {
        const senderId=req.user._id
        const list=await chatModel.find({$or: [
            { receiver: senderId },
            { sender: senderId }
        ]}).populate({
            path: 'sender',
            model: 'users' // Assuming the model name for users is 'User'
        });
        res.status(200).json({ list })
 
    } catch (error) {
        res.status(500).json({ errMsg: 'Server error' })
    }
}

module.exports={
    accessChatRoom,
    addMessage,getUsers
}