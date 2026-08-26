const mongoose = require("mongoose");

const gameSettingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            default: "main"
        },

        winPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 30
        },

        enabled: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "GameSetting",
    gameSettingSchema
);