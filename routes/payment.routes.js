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
    
    const {htmlPaymentStatus} = require(
        "../controllers/payStatus.controller.js" );
    
    


router.post(
    "/create",
    auth,
    createPayment
);


router.get(
    "/status",
    checkPaymentStatus
);

router.post("/status",auth, htmlPaymentStatus);


module.exports = router;