const crypto = require("crypto");
const User = require("../models/User");
const phonepeClient =
    require("../config/phonepe");

const Payment =
    require("../models/Payment");

let id ;
exports.createPayment = async (
    req,
    res
) => {

    try {

        const amount =
            Number(req.body.amount);
          id = req.user._id;
        /*
         * Amount is supplied in INR
         * from our application.
         *
         * PhonePe expects the lowest
         * currency denomination.
         *
         * Example:
         *
         * ₹100 = 10000 paise
         */

        if (
            !Number.isFinite(amount) ||
            amount < 10 ||
            amount > 100000
        ) {

            return res.status(400).json({

                message:
                    "Amount must be between ₹10 and ₹100000"

            });

        }


        const merchantOrderId =
            `ORD-${Date.now()}-${crypto
                .randomBytes(4)
                .toString("hex")
                .toUpperCase()}`;


        /*
         * Store order before redirecting
         * the user to PhonePe.
         */

        const payment =
            await Payment.create({

                user:
                    req.user._id,

                merchantOrderId,

                amount,

                status:
                    "PENDING",

                paymentType:
                    "PRODUCT"

            });


        /*
         * PhonePe expects paise.
         */

        const amountInPaise =
            Math.round(
                amount * 100
            );


        const redirectUrl =
            `${process.env.PHONEPE_REDIRECT_URL}?orderId=${encodeURIComponent(
                merchantOrderId
            )}`;


        const request =
            require(
                "@phonepe-pg/pg-sdk-node"
            )
            .StandardCheckoutPayRequest
            .builder()

            .merchantOrderId(
                merchantOrderId
            )

            .amount(
                amountInPaise
            )

            .redirectUrl(
                redirectUrl
            )

            .build();


        const response =
            await phonepeClient.pay(
                request
            );


        /*
         * Do not trust the browser
         * for payment completion.
         */

        return res.status(201).json({

            success: true,

            orderId:
                merchantOrderId,

            paymentId:
                payment._id,

            checkoutUrl:
                response.redirectUrl

        });


    } catch (error) {

        console.error(
            "PhonePe create payment error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not create payment"

        });

    }

};

// payment status checkout

exports.checkPaymentStatus =
    async (req, res) => {

        try {

            const {
                orderId
            } = req.query;
          
            const payment =
                await Payment.findOne({
                    merchantOrderId:
                        orderId,

                    user:
                        id
                });


            if (!payment) {

                return res.status(404).json({

                    message:
                        "Payment not found"

                });

            }


            const response =
                await phonepeClient
                    .getOrderStatus(
                        orderId
                    );
           
            const state =
                response.state;


            payment.phonePeState =
                state;


            if (
                state ===
                "COMPLETED"
            ) {

                payment.status =
                    "COMPLETED";

            } else if (
                state ===
                "FAILED"
            ) {

                payment.status =
                    "FAILED";

            }


            await payment.save();
          if(payment.phonePeState === "COMPLETED"){
           const finalUser =
                await User.findByIdAndUpdate(

                    id,

                    {
                        $inc: {
                            balance: payment.amount
                        }
                    },

                    {
                        new: true
                    }

                );
                if(finalUser){
                  
                 // res.redirect('http://localhost:4000/game.html'); 
                  return res.json({

                success: true,

                orderId,

                status:
                    payment.status,

                phonePeState:
                    payment.phonePeState,

                amount:
                    payment.amount

            });
                }
          }

            


        } catch (error) {

            console.error(
                "PhonePe status error:",
                error
            );


            return res.status(500).json({

                message:
                    "Could not check payment"

            });

        }

    };