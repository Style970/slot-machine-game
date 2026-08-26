const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

function normalizeMobile(mobile) {

    return String(mobile)
        .replace(/\s+/g, "")
        .trim();

}

function createToken(user) {

    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

}


exports.register = async (req, res) => {

    try {

        const {
            name,
            mobile,
            password
        } = req.body;


        if (
            !name ||
            !mobile ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "Name, mobile and password are required"
            });

        }


        const normalizedMobile =
            normalizeMobile(mobile);


        if (
            !/^\+?[0-9]{10,15}$/.test(
                normalizedMobile
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid mobile number"
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters"
            });

        }


        const existing =
            await User.findOne({
                mobile: normalizedMobile
            });


        if (existing) {

            return res.status(409).json({
                message:
                    "Mobile number already registered"
            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        const initialBalance =
            Number(
                process.env.INITIAL_BALANCE || 100
            );


        const user =
            await User.create({

                name: name.trim(),

                mobile: normalizedMobile,

                password: hashedPassword,

                balance: initialBalance

            });


        const token =
            createToken(user);


        return res.status(201).json({

            message:
                "Registration successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                mobile: user.mobile,

                balance: user.balance,

                role: user.role

            }

        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Registration failed"
        });

    }

};


exports.login = async (req, res) => {

    try {

        const {
            mobile,
            password
        } = req.body;


        if (
            !mobile ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "Mobile and password are required"
            });

        }


        const normalizedMobile =
            normalizeMobile(mobile);


        const user =
            await User
                .findOne({
                    mobile: normalizedMobile
                })
                .select("+password");


        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid mobile or password"
            });

        }


        const valid =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!valid) {

            return res.status(401).json({
                message:
                    "Invalid mobile or password"
            });

        }


        const token =
            createToken(user);


        return res.json({

            message: "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                mobile: user.mobile,

                balance: user.balance,

                role: user.role

            }

        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Login failed"
        });

    }

};


exports.me = async (req, res) => {

    return res.json({

        user: {

            id: req.user._id,

            name: req.user.name,

            mobile: req.user.mobile,

            balance: req.user.balance,

            role: req.user.role

        }

    });

};