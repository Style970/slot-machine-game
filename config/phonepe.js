const {
    StandardCheckoutClient,
    Env
} = require("@phonepe-pg/pg-sdk-node");


const clientId =
    process.env.PHONEPE_CLIENT_ID;

const clientSecret =
    process.env.PHONEPE_CLIENT_SECRET;

const clientVersion =
    Number(
        process.env.PHONEPE_CLIENT_VERSION || 1
    );


const environment =
    process.env.PHONEPE_ENV === "PRODUCTION"
        ? Env.PRODUCTION
        : Env.SANDBOX;


if (!clientId) {
    throw new Error(
        "PHONEPE_CLIENT_ID is missing"
    );
}


if (!clientSecret) {
    throw new Error(
        "PHONEPE_CLIENT_SECRET is missing"
    );
}


const phonepeClient =
    StandardCheckoutClient.getInstance(
        clientId,
        clientSecret,
        clientVersion,
        environment
    );


module.exports = phonepeClient;