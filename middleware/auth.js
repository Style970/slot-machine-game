const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function auth(req, res, next) {

    try {

        const header =
            req.headers.authorization;

        if (!header) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const [type, token] =
            header.split(" ");

        if (
            type !== "Bearer" ||
            !token
        ) {
            return res.status(401).json({
                message: "Invalid authorization"
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        const user =
            await User.findById(
                decoded.userId
            );

        if (!user || !user.active) {
            return res.status(401).json({
                message: "User not found or disabled"
            });
        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }
}

module.exports = auth;