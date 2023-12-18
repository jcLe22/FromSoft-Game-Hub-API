const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'is required.']
    },
    email: {
        type: String,
        required: [true, 'is required.']
    },
    password: {
        type: String,
        required: [true, 'is required.']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    orderedProduct: [{
        products: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Game',
                required: true
            },
            productName: {
                type: String,
            },
            quantity: {
                type: Number,
                required: true
            }
        }],
        totalAmount: {
            type: Number
        },
        purchasedOn: {
            type: Date,
            default: new Date()
        }
    }]
});

module.exports = mongoose.model('User', userSchema);