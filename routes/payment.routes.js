const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");


const {
    createPayment,
    checkPaymentStatus
} =
    require(
        "../controllers/payment.controller"
    );


router.post(
    "/create",
    auth,
    createPayment
);


router.get(
    "/status",
    checkPaymentStatus
);


module.exports = router;