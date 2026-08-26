const mongoose = require("mongoose");

const QRCode = require("qrcode");

const User =
    require("../models/User");

const Deposit =
    require("../models/Deposit");

const {
    createMerchantOrderId,
    createPayment,
    checkPayment,
    verifyCallback
} = require("../services/phonepe");


/*
|--------------------------------------------------------------------------
| Allowed amounts
|--------------------------------------------------------------------------
*/

const ALLOWED_AMOUNTS = [
    100,
    200,
    500,
    1000,
    2000,
    5000
];


/*
|--------------------------------------------------------------------------
| Create deposit
|--------------------------------------------------------------------------
*/

exports.createDeposit = async (
    req,
    res
) => {

    try {

        const amount =
            Number(req.body.amount);


        if (
            !Number.isFinite(amount)
        ) {

            return res.status(400).json({

                message:
                    "Invalid amount"

            });

        }


        if (
            !ALLOWED_AMOUNTS.includes(
                amount
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid deposit amount"

            });

        }


        const user =
            await User.findById(
                req.user._id
            );


        if (
            !user ||
            !user.active
        ) {

            return res.status(401).json({

                message:
                    "User account unavailable"

            });

        }


        const merchantOrderId =
            createMerchantOrderId();


        /*
         * Create local pending transaction
         * BEFORE calling payment provider.
         */

        const deposit =
            await Deposit.create({

                user:
                    user._id,

                merchantOrderId,

                amount,

                status:
                    "PENDING"

            });


        try {

            const payment =
                await createPayment({

                    merchantOrderId,

                    amount,

                    user: {

                        id:
                            user._id.toString(),

                        name:
                            user.name,

                        mobile:
                            user.mobile

                    }

                });


            if (
                payment.paymentUrl
            ) {

                deposit.paymentUrl =
                    payment.paymentUrl;

            }


            if (
                payment.qrData
            ) {

                deposit.qrData =
                    payment.qrData;

            }


            await deposit.save();


            /*
             * If provider gives a QR payload,
             * generate an image server-side.
             */

            let qrImage = null;


            if (
                payment.qrData
            ) {

                qrImage =
                    await QRCode.toDataURL(
                        payment.qrData
                    );

            }


            return res.status(201).json({

                success: true,

                orderId:
                    merchantOrderId,

                amount,

                status:
                    deposit.status,

                paymentUrl:
                    deposit.paymentUrl,

                qrData:
                    deposit.qrData,

                qrImage

            });


        } catch (providerError) {

            await Deposit.findByIdAndUpdate(

                deposit._id,

                {
                    $set: {
                        status: "FAILED"
                    }
                }

            );


            throw providerError;

        }


    } catch (error) {

        console.error(
            "Create deposit error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not create payment"

        });

    }

};


/*
|--------------------------------------------------------------------------
| Payment status
|--------------------------------------------------------------------------
*/

exports.paymentStatus = async (
    req,
    res
) => {

    try {

        const {
            orderId
        } = req.params;


        const deposit =
            await Deposit.findOne({

                merchantOrderId:
                    orderId,

                user:
                    req.user._id

            });


        if (!deposit) {

            return res.status(404).json({

                message:
                    "Deposit not found"

            });

        }


        /*
         * If already successful, simply return it.
         */

        if (
            deposit.status === "SUCCESS"
        ) {

            return res.json({

                orderId:
                    deposit.merchantOrderId,

                amount:
                    deposit.amount,

                status:
                    deposit.status,

                credited:
                    true

            });

        }


        /*
         * Ask provider for authoritative status.
         */

        const provider =
            await checkPayment(
                deposit.merchantOrderId
            );


        if (
            provider.status ===
            "SUCCESS"
        ) {

            const result =
                await creditDeposit(
                    deposit._id,
                    provider.providerTransactionId
                );


            return res.json({

                orderId:
                    deposit.merchantOrderId,

                amount:
                    deposit.amount,

                status:
                    "SUCCESS",

                credited:
                    result.credited

            });

        }


        if (
            provider.status ===
            "FAILED"
        ) {

            deposit.status =
                "FAILED";

            deposit.verifiedAt =
                new Date();

            await deposit.save();

        }


        return res.json({

            orderId:
                deposit.merchantOrderId,

            amount:
                deposit.amount,

            status:
                deposit.status,

            credited:
                false

        });


    } catch (error) {

        console.error(
            "Payment status error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not check payment"

        });

    }

};


/*
|--------------------------------------------------------------------------
| Credit deposit
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This function is idempotent.
|
| A successful payment must never credit the same
| deposit twice.
|
*/

async function creditDeposit(
    depositId,
    providerTransactionId
) {

    const session =
        await mongoose.startSession();


    try {

        let credited = false;


        await session.withTransaction(
            async () => {

                const deposit =
                    await Deposit.findOne({

                        _id:
                            depositId

                    }).session(
                        session
                    );


                if (!deposit) {

                    throw new Error(
                        "Deposit not found"
                    );

                }


                /*
                 * Already credited.
                 */

                if (
                    deposit.status ===
                    "SUCCESS"
                ) {

                    return;

                }


                const user =
                    await User.findById(
                        deposit.user
                    ).session(
                        session
                    );


                if (!user) {

                    throw new Error(
                        "User not found"
                    );

                }


                /*
                 * Credit exactly once.
                 */

                user.balance +=
                    deposit.amount;


                await user.save({
                    session
                });


                deposit.status =
                    "SUCCESS";


                deposit.providerTransactionId =
                    providerTransactionId ||
                    deposit.providerTransactionId;


                deposit.verifiedAt =
                    new Date();


                deposit.creditedAt =
                    new Date();


                await deposit.save({
                    session
                });


                credited = true;

            }
        );


        return {
            credited
        };


    } finally {

        await session.endSession();

    }

}


/*
|--------------------------------------------------------------------------
| PhonePe callback
|--------------------------------------------------------------------------
*/

exports.phonePeCallback = async (
    req,
    res
) => {

    try {

        /*
         * Verify provider authentication/signature FIRST.
         */

        const valid =
            verifyCallback(req);


        if (!valid) {

            return res.status(401).json({

                message:
                    "Invalid callback"

            });

        }


        /*
         * Extract these values according to
         * the current PhonePe callback schema.
         */

        const {
            merchantOrderId,
            status,
            providerTransactionId
        } = req.body;


        if (
            !merchantOrderId
        ) {

            return res.status(400).json({

                message:
                    "Missing order ID"

            });

        }


        const deposit =
            await Deposit.findOne({

                merchantOrderId

            });


        if (!deposit) {

            return res.status(404).json({

                message:
                    "Deposit not found"

            });

        }


        if (
            status === "SUCCESS"
        ) {

            await creditDeposit(

                deposit._id,

                providerTransactionId

            );

        } else if (
            status === "FAILED"
        ) {

            /*
             * Never overwrite a successful transaction.
             */

            if (
                deposit.status !==
                "SUCCESS"
            ) {

                deposit.status =
                    "FAILED";

                deposit.verifiedAt =
                    new Date();

                await deposit.save();

            }

        }


        return res.json({

            success: true

        });


    } catch (error) {

        console.error(
            "PhonePe callback error:",
            error
        );


        return res.status(500).json({

            message:
                "Callback processing failed"

        });

    }

};


/*
|--------------------------------------------------------------------------
| Deposit history
|--------------------------------------------------------------------------
*/

exports.history = async (
    req,
    res
) => {

    try {

        const deposits =
            await Deposit.find({

                user:
                    req.user._id

            })
            .sort({
                createdAt: -1
            })
            .limit(50);


        return res.json({

            deposits

        });


    } catch (error) {

        return res.status(500).json({

            message:
                "Could not load deposits"

        });

    }

};