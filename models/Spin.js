const mongoose = require("mongoose");

const spinSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        bet: {
            type: Number,
            required: true
        },

        result: {
            type: [[String]],
            required: true
        },

        wins: {
            type: Array,
            default: []
        },

        winnings: {
            type: Number,
            default: 0
        },

        balanceBefore: {
            type: Number,
            required: true
        },

        balanceAfter: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Spin", spinSchema);