const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        merchantOrderId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        amount: {
            type: Number,
            required: true,
            min: 1
        },

        currency: {
            type: String,
            default: "INR"
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "SUCCESS",
                "FAILED",
                "EXPIRED"
            ],
            default: "PENDING",
            index: true
        },

        providerTransactionId: {
            type: String,
            default: null
        },

        paymentUrl: {
            type: String,
            default: null
        },

        qrData: {
            type: String,
            default: null
        },

        creditedAt: {
            type: Date,
            default: null
        },

        verifiedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("Deposit", depositSchema);