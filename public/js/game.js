const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "/index.html";

}


const reels = [

    document.getElementById("reel0"),

    document.getElementById("reel1"),

    document.getElementById("reel2"),

    document.getElementById("reel3"),

    document.getElementById("reel4")

];


const balanceElement =
    document.getElementById("balance");

const usernameElement =
    document.getElementById("username");

const messageElement =
    document.getElementById("message");

const betElement =
    document.getElementById("bet");

const betControl =
    document.getElementById("betControl");

const spinButton =
    document.getElementById("spinButton");

const betMinus =
    document.getElementById("betMinus");

const betPlus =
    document.getElementById("betPlus");

const logoutButton =
    document.getElementById("logoutButton");

const historyButton =
    document.getElementById("historyButton");

const historyElement =
    document.getElementById("history");


let balance = 0;

let bet = 10;

let spinning = false;


/* =========================
   SYMBOLS
========================= */

const symbols = [
    "🍒",
    "🍋",
    "🍊",
    "🍉",
    "⭐",
    "💎"
];


function randomSymbol() {

    return symbols[
        Math.floor(
            Math.random() *
            symbols.length
        )
    ];

}


/* =========================
   CREATE REEL
========================= */

function createReel(reel) {

    reel.innerHTML = "";


    for (
        let row = 0;
        row < 3;
        row++
    ) {

        const element =
            document.createElement("div");

        element.className =
            "symbol";

        element.textContent =
            randomSymbol();

        reel.appendChild(element);

    }

}


reels.forEach(
    createReel
);


/* =========================
   DISPLAY RESULT
========================= */

function displayGrid(grid) {

    for (
        let reel = 0;
        reel < 5;
        reel++
    ) {

        const elements =
            reels[reel]
                .querySelectorAll(
                    ".symbol"
                );


        for (
            let row = 0;
            row < 3;
            row++
        ) {

            elements[row].textContent =
                grid[reel][row];

        }

    }

}
/* =========================
   HIGHLIGHT WINS
========================= */

function highlightWins(
    wins,
    paylines
) {
  
    wins.forEach(win => {

        const line =
            paylines[win.line];

        for (
            let reel = 0;
            reel < win.count;
            reel++
        ) {

            const row =
                line[reel];


            const element =
                reels[reel]
                    .querySelectorAll(
                        ".symbol"
                    )[row];

            if (element) {

                element.classList.add(
                    "win"
                );

            }

        }

    });

}



/* =========================
   ANIMATION
========================= */

function animateReel(
    reel,
    duration,
    finalColumn
) {

    return new Promise(resolve => {

        reel.classList.add(
            "spinning"
        );
       

        const interval =
            setInterval(() => {

                reel
                    .querySelectorAll(
                        ".symbol"
                    )
                    .forEach(element => {

                        element.textContent =
                            randomSymbol();

                    });

            }, 80);


        setTimeout(() => {

            clearInterval(interval);

            reel.classList.remove(
                "spinning"
            );
          playGameSound( sounds.reel);

            const elements =
                reel.querySelectorAll(
                    ".symbol"
                );


            elements.forEach(
                (element, row) => {

                    element.textContent =
                        finalColumn[row];

                }
            );


            resolve();

        }, duration);

    });

}


/* =========================
   LOAD USER
========================= */

async function loadUser() {

    try {

        const response =
            await fetch(
                "/api/auth/me",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        balance =
            data.user.balance;


        usernameElement.textContent =
            data.user.name;


        updateUI();


    } catch (error) {

        localStorage.clear();

        window.location.href =
            "/index.html";

    }

}


/* =========================
   UPDATE UI
========================= */

function updateUI() {

    balanceElement.textContent =
        balance;

    betElement.textContent =
        bet;

    betControl.textContent =
        bet;

}

/* =========================
   HIGHLIGHT WINS
========================= */


function clearWins() {

    document
        .querySelectorAll(".symbol.win")
        .forEach(element => {

            element.classList.remove(
                "win"
            );

        });

}





/* =========================
   SPIN
========================= */

async function spin() {

    if (spinning) {
        return;
    }


    if (balance < bet) {

        messageElement.textContent =
            "❌ Not enough credits";

        messageElement.className =
            "message lose";

        return;

    }


    spinning = true;

   playGameSound(
    sounds.spin
    );
    spinButton.disabled = true;

    betMinus.disabled = true;

    betPlus.disabled = true;
   
    clearWins();

    messageElement.textContent =
        "🎰 Spinning...";

    messageElement.className =
        "message";


    try {

        /*
            Ask server for result.

            Client does NOT control
            win percentage.
        */

        const response =
            await fetch(
                "/api/game/spin",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({
                            bet
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Spin failed"
            );

        }


        /*
            Server has already generated
            the complete 5x3 result.
        */

        const grid =
            data.result;


        await Promise.all([

            animateReel(
                reels[0],
                700,
                grid[0]
            ),

            animateReel(
                reels[1],
                1000,
                grid[1]
            ),

            animateReel(
                reels[2],
                1300,
                grid[2]
            ),

            animateReel(
                reels[3],
                1600,
                grid[3]
            ),

            animateReel(
                reels[4],
                1900,
                grid[4]
            )

        ]);


        /*
            Server is authoritative.
        */

        balance =
            data.balance;


        if (
            data.winnings > 0
        ) {
          
          highlightWins(
            data.wins,
            data.paylines
        );

        
            const jackpot =
                data.wins.some(
                    win =>
                        win.count === 5
                );
             const meghaWin = data.wins.some(
               win => win.count === 4
               );


            if (jackpot) {
               playGameSound(sounds.jackpot);
                messageElement.textContent =
                    `🎉 JACKPOT! +${data.winnings}`;
    
                messageElement.className =
                    "message jackpot";
                    playGameSound(sounds.jackpot2);
      
            } else if(meghaWin){
              messageElement.textContent =
                    `🎉 MEGHA WIN! +${data.winnings}`;
                    playGameSound(sounds.meghaWin);
                    messageElement.className =
                    "message jackpot";
            }else {
                playGameSound(sounds.win);
                messageElement.textContent =
                    `🎉 WIN! +${data.winnings}`;

                messageElement.className =
                    "message win";

            }

        } else {
          playGameSound(
          sounds.lose
         );

            messageElement.textContent =
                "😢 No win";

            messageElement.className =
                "message lose";

        }


        updateUI();


    } catch (error) {

        messageElement.textContent =
            error.message;

        messageElement.className =
            "message lose";

    }


    spinning = false;

    stopSound(sounds.spin);
    spinButton.disabled = false;

    betMinus.disabled = false;

    betPlus.disabled = false;

}


/* =========================
   BET +
========================= */

betPlus.addEventListener(
    "click",
    () => {

        if (
            !spinning &&
            bet < 100
        ) {

            bet += 5;

            updateUI();

        }

    }
);


/* =========================
   BET -
========================= */

betMinus.addEventListener(
    "click",
    () => {

        if (
            !spinning &&
            bet > 5
        ) {

            bet -= 5;

            updateUI();

        }

    }
);


/* =========================
   SPIN
========================= */

spinButton.addEventListener(
    "click",
    spin
);


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    () => {

        localStorage.clear();

        window.location.href =
            "/index.html";

    }
);


/* =========================
   HISTORY
========================= */

historyButton.addEventListener(
    "click",
    async () => {

        try {

            const response =
                await fetch(
                    "/api/game/history",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message
                );

            }


            historyElement.innerHTML =
                data.spins.map(
                    spin => `

                    <div class="history-item">

                        <strong>
                            Bet: ${spin.bet}
                        </strong>

                        <span>
                            Win: ${spin.winnings}
                        </span>

                        <small>
                            Balance:
                            ${spin.balanceAfter}
                        </small>

                    </div>

                    `
                ).join("");


        } catch (error) {

            historyElement.textContent =
                error.message;

        }

    }
);

/* =========================
   START
========================= */

loadUser();


document
    .getElementById(
        "addBalanceButton"
    )
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "/payment.html";

        }
    );