const mongoose=require('mongoose')

const chatSchema=new mongoose.Schema({
    chatType: {
        type: String,
        enum: ['user', 'agency'],
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'chatType',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'chatType',
        required: true
    },
    messages: [
        {
            text: {
                type: String,
                required: true,
                
            },
            senderType: {
                type: String,
                enum: ['user', 'agency'],
                required: true
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'senderType',
                required: true
            },
            is_read: {
                type: Boolean,
                default: false
            },
            read_at: {
                type: Date
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
            
        }
    ],
})

const ChatModel = mongoose.model('Chat', chatSchema);

module.exports = ChatModel;