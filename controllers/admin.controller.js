const GameSetting =
    require("../models/GameSetting");


exports.getSettings = async (
    req,
    res
) => {

    let settings =
        await GameSetting.findOne({
            name: "main"
        });


    if (!settings) {

        settings =
            await GameSetting.create({
                name: "main",
                winPercentage: 30,
                enabled: true
            });

    }


    return res.json({
        settings
    });

};


exports.updateSettings = async (
    req,
    res
) => {

    const {
        winPercentage,
        enabled
    } = req.body;


    const update = {};


    if (
        winPercentage !== undefined
    ) {

        const percentage =
            Number(winPercentage);


        if (
            !Number.isFinite(
                percentage
            ) ||
            percentage < 0 ||
            percentage > 100
        ) {

            return res.status(400).json({
                message:
                    "winPercentage must be 0-100"
            });

        }


        update.winPercentage =
            percentage;

    }


    if (
        enabled !== undefined
    ) {

        if (
            typeof enabled !==
            "boolean"
        ) {

            return res.status(400).json({
                message:
                    "enabled must be boolean"
            });

        }


        update.enabled =
            enabled;

    }


    const settings =
        await GameSetting.findOneAndUpdate(

            {
                name: "main"
            },

            {
                $set: update
            },

            {
                new: true,
                upsert: true
            }

        );


    return res.json({

        message:
            "Game settings updated",

        settings

    });

};