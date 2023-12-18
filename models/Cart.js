const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true,
        },
        productName: {
            type: String,
        },
        quantity: {
            type: Number,
            required: true,
        },
        subtotal: {
            type: Number,
            required: true
        },
    }],
    totalQuantity: {
        type: Number,
        default: 0,
    },
    isSubmitted: {
        type: Boolean,
        default: false
    }
});

// Middleware to update total quantity before saving
cartSchema.pre('save', function (next) {
    this.totalQuantity = this.items.reduce((total, item) => total + item.quantity, 0);
    next();
});

module.exports = mongoose.model('Cart', cartSchema);