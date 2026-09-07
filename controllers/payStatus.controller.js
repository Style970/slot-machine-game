const crypto = require("crypto");
const User = require("../models/User");
const phonepeClient =
    require("../config/phonepe");

const Payment =
    require("../models/Payment");

exports.htmlPaymentStatus =
    async (req, res) => {

        try {

            const {
                orderId
            } = req.body;
          
            const payment =
                await Payment.findOne({
                    merchantOrderId:
                        orderId,

                    user:
                        req.user._id
                });

           
           
            if (!payment) {

                return res.status(404).json({

                    message:
                        "Payment not found"

                });

            }
            
            if(payment.status === 'FAILED'){
              return res.json({

                success: false,

                orderId: payment.merchantOrderId,

                status:
                    payment.status,

                phonePeState:
                    payment.phonePeState,

                amount:
                    payment.amount,
                  
                  timestamp: payment.createdAt

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

                    req.user._id,

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
                  //res.send(successHTML);
                  return res.json({

                success: true,

                orderId,

                status:
                    payment.status,

                phonePeState:
                    payment.phonePeState,

                amount:
                    payment.amount,
                    
                  paymentMode: response.paymentDetails[0].paymentMode,
                  
                  transactionId: response.paymentDetails[0].transactionId,
                  
                  timestamp: response.paymentDetails[0].timestamp,
                  
                  other: response.paymentDetails[0].splitInstruments
                  

              });
            
               }
          }else if(payment.phonePeState === "FAILED"){
            return res.json({

                success: false,

                orderId,

                status:
                    payment.status,

                phonePeState:
                    payment.phonePeState,

                amount:
                    payment.amount,
                timestamp: payment.createdAt
              });
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