const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        mobile: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },

        balance: {
            type: Number,
            default: 1000,
            min: 0
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);