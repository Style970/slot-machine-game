const mongoose = require("mongoose");


const paymentSchema =
    new mongoose.Schema(
        {

            user: {
                type:
                    mongoose.Schema.Types.ObjectId,

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
                    "COMPLETED",
                    "FAILED",
                    "CANCELLED"
                ],

                default: "PENDING"
            },


            phonePeState: {
                type: String,

                default: null
            },


            paymentType: {
                type: String,

                default: "PRODUCT"
            },


            metadata: {
                type: Object,

                default: {}
            }

        },

        {
            timestamps: true
        }
    );


module.exports =
    mongoose.model(
        "Payment",
        paymentSchema
    );