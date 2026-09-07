const User = require("../models/User");
const GameSetting =
    require("../models/GameSetting");
const Spin = require("../models/Spin");

const {
    generateResult,
    checkPaylines,
    calculateWinnings,
    paylines
} = require("../utils/slot");


exports.spin = async (req, res) => {

    try {

        const bet =
            Number(req.body.bet);


        if (
            !Number.isFinite(bet) ||
            bet < 1 ||
            bet > 100
        ) {

            return res.status(400).json({
                message:
                    "Bet must be between 1 and 100"
            });

        }


        /*
            Get current game settings.
        */

        const settings =
            await GameSetting.findOne({
                name: "main"
            });


        if (
            !settings ||
            !settings.enabled
        ) {

            return res.status(503).json({
                message:
                    "Game is currently disabled"
            });

        }


        /*
            Atomic balance deduction.

            This prevents two simultaneous
            requests from spending the same
            balance.
        */

        const updatedUser =
            await User.findOneAndUpdate(

                {
                    _id: req.user._id,

                    active: true,

                    balance: {
                        $gte: bet
                    }
                },

                {
                    $inc: {
                        balance: -bet
                    }
                },

                {
                    new: true
                }

            );


        if (!updatedUser) {

            return res.status(400).json({
                message:
                    "Insufficient balance"
            });

        }


        const balanceBefore =
            updatedUser.balance + bet;


        /*
            Server controls result.
        */

        const result =
            generateResult(
                settings.winPercentage
            );


        const wins =
            checkPaylines(result);


        const winnings =
            calculateWinnings(
                wins,
                bet
            );


        /*
            Add winnings.
        */

        let finalUser =
            updatedUser;


        if (winnings > 0) {

            finalUser =
                await User.findByIdAndUpdate(

                    req.user._id,

                    {
                        $inc: {
                            balance: winnings
                        }
                    },

                    {
                        new: true
                    }

                );

        }


        /*
            Save spin history.
        */

        const spin =
            await Spin.create({

                user:
                    req.user._id,

                bet,

                result,

                wins,

                winnings,

                balanceBefore,

                balanceAfter:
                    finalUser.balance

            });


        return res.json({

            success: true,

            result,

            wins,

            winnings,

            balance:
                finalUser.balance,

            spinId:
                spin._id,
                paylines: paylines

        });


    } catch (error) {

        console.error(
            "Spin error:",
            error
        );


        return res.status(500).json({
            message:
                "Spin failed"
        });

    }

};


exports.history = async (req, res) => {

    try {

        const spins =
            await Spin.find({
                user: req.user._id
            })
            .sort({
                createdAt: -1
            })
            .limit(50);


        return res.json({
            spins
        });

    } catch (error) {

        return res.status(500).json({
            message:
                "Could not load history"
        });

    }

};