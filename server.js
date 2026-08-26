require("dotenv").config();

const express =
    require("express");

const mongoose =
    require("mongoose");

const cors =
    require("cors");

const helmet =
    require("helmet");

const rateLimit =
    require("express-rate-limit");

const path =
    require("path");

const connectDB =
    require("./config/db");


const authRoutes =
    require("./routes/auth.routes");

const gameRoutes =
    require("./routes/game.routes");

const adminRoutes =
    require("./routes/admin.routes");
    
 const walletRoutes =
    require("./routes/wallet.routes");


const app =
    express();


/* =========================
   SECURITY
========================= */

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);


app.use(
    cors()
);


app.use(
    express.json({
        limit: "50kb"
    })
);


/* =========================
   RATE LIMIT
========================= */

const apiLimiter =
    rateLimit({

        windowMs:
            60 * 1000,

        max: 100,

        message: {
            message:
                "Too many requests"
        }

    });


app.use(
    "/api",
    apiLimiter
);


/* =========================
   STATIC FILES
========================= */

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


/* =========================
   ROUTES
========================= */

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/game",
    gameRoutes
);


app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/wallet",
    walletRoutes
);


/* =========================
   HEALTH
========================= */

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            status: "OK"
        });

    }
);


/* =========================
   START
========================= */

const PORT =
    process.env.PORT || 4000;
const HOST = '0.0.0.0';

async function start() {

    await connectDB();


    app.listen(
        PORT, HOST,
        () => {

            console.log(
                `Server running on port ${PORT}`
            );

            console.log(
                `http://localhost:${PORT}`
            );

        }
    );

}


start();