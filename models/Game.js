const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'is required.']
    },
    description: {
        type: String,
        required: [true, 'is required.']
    },
    price: {
        type: Number,
        required: [true, 'is required.']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdOn: {
        type: Date,
        default: new Date()
    },
    imgUrl: {
        type: String,
        required: [true, 'is required']
    },
    videoUrl: {
        type: String,
        required: [true, 'is required']
    },
    userOrders: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId
        }
    }]
})

module.exports = mongoose.model('Game', gameSchema);