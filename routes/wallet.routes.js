const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {
    createDeposit,
    paymentStatus,
    phonePeCallback,
    history
} = require(
    "../controllers/wallet.controller"
);


/*
|--------------------------------------------------------------------------
| User wallet
|--------------------------------------------------------------------------
*/

router.post(
    "/deposit",
    auth,
    createDeposit
);


router.get(
    "/deposit/:orderId",
    auth,
    paymentStatus
);


router.get(
    "/deposits",
    auth,
    history
);


/*
|--------------------------------------------------------------------------
| Provider callback
|--------------------------------------------------------------------------
|
| Do NOT put auth middleware here.
| Provider calls this endpoint.
|
*/

router.post(
    "/phonepe/callback",
    phonePeCallback
);


module.exports = router;