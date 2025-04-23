const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true,
        unique: true,
        trim: true,
    },
    productId: {
        type: Number,
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
        trim: true,
    },
    destination: {
        type: String,
        required: true,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'accepted', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
        trim: true,
    },
    updatedAmount: {
        type: Number,
        trim: true,
    },
    distance: {
        type: Number,
        trim: true,
    },
    distancePrice: {
        type: Number,
        trim: true,
    },
    logisticsProviderEmail: {
        type: String,
        trim: true,
    },
    pickup: {
        type: String,
        trim: true,
    },
    paymentStatus: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
