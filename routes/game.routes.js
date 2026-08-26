const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {
    spin,
    history
} = require(
    "../controllers/game.controller"
);


router.post(
    "/spin",
    auth,
    spin
);


router.get(
    "/history",
    auth,
    history
);


module.exports = router;