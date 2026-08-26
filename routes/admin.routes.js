const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const admin =
    require("../middleware/admin");

const {
    getSettings,
    updateSettings
} = require(
    "../controllers/admin.controller"
);


router.get(
    "/settings",
    auth,
    admin,
    getSettings
);


router.put(
    "/settings",
    auth,
    admin,
    updateSettings
);


module.exports = router;