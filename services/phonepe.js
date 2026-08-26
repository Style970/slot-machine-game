const crypto = require("crypto");

/*
|--------------------------------------------------------------------------
| PhonePe Provider
|--------------------------------------------------------------------------
|
| Keep ALL PhonePe credentials and provider-specific signing logic here.
|
| Do not expose these values to the browser.
|
*/

const config = {
    merchantId:
        process.env.PHONEPE_MERCHANT_ID,

    clientId:
        process.env.PHONEPE_CLIENT_ID,

    clientSecret:
        process.env.PHONEPE_CLIENT_SECRET,

    clientVersion:
        process.env.PHONEPE_CLIENT_VERSION,

    environment:
        process.env.PHONEPE_ENV || "sandbox"
};


/*
|--------------------------------------------------------------------------
| Generate merchant order ID
|--------------------------------------------------------------------------
*/

function createMerchantOrderId() {

    return (
        "DEP_" +
        Date.now() +
        "_" +
        crypto
            .randomBytes(6)
            .toString("hex")
            .toUpperCase()
    );

}


/*
|--------------------------------------------------------------------------
| Create PhonePe payment
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Replace the implementation below with the exact current
| PhonePe Standard Checkout / QR API request specified
| by your merchant account documentation.
|
*/

async function createPayment({
    merchantOrderId,
    amount,
    user
}) {

    /*
     * amount should normally be converted into the smallest
     * currency unit required by the provider.
     *
     * DO NOT assume the provider's current endpoint/signature
     * format without checking its current documentation.
     */

    return {

        merchantOrderId,

        amount,

        status: "PENDING",

        paymentUrl: null,

        qrData: null,

        message:
            "PhonePe provider configuration required"

    };

}


/*
|--------------------------------------------------------------------------
| Check payment
|--------------------------------------------------------------------------
*/

async function checkPayment(
    merchantOrderId
) {

    /*
     * Implement the current PhonePe status API here.
     */

    return {

        merchantOrderId,

        status: "PENDING",

        providerTransactionId: null

    };

}


/*
|--------------------------------------------------------------------------
| Verify callback
|--------------------------------------------------------------------------
*/

function verifyCallback(
    req
) {

    /*
     * Implement the exact callback authentication/signature
     * verification required by the current PhonePe API.
     *
     * NEVER trust req.body.status by itself.
     */

    return false;

}


module.exports = {

    config,

    createMerchantOrderId,

    createPayment,

    checkPayment,

    verifyCallback

};