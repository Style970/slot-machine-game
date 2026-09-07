/* =========================
   SOUND EFFECTS
========================= */

const sounds = {
    spin: new Audio("/sounds/spin.mp3"),
    reel: new Audio("/sounds/reel-stop.mp3"),
    win: new Audio("/sounds/mixkit-magical-coin-win-1936.wav"),
    freeSpin: new Audio("/sounds/free-spin.mp3"),
    lose: new Audio("/sounds/mixkit-lose.wav"),
    jackpot: new Audio("/sounds/jackpot-2.mp3"),
    jackpot2: new Audio("/sounds/jackport.mp3"),
    meghaWin: new Audio("/sounds/meghaWin.mp3")
};


/*
 * Preload sounds
 */
Object.values(sounds).forEach(sound => {
    sound.preload = "auto";
});


function playSound(sound) {

    try {

        sound.pause();

        sound.currentTime = 0;

        const promise = sound.play();

        if (promise !== undefined) {
            promise.catch(() => {
                /*
                 * Browser may block audio until
                 * the user interacts with the page.
                 */
            });
        }

    } catch (error) {

        console.warn(
            "Sound error:",
            error
        );

    }

}


function stopSound(sound) {

    try {

        sound.pause();

        sound.currentTime = 0;

    } catch (error) {

        console.warn(
            "Sound stop error:",
            error
        );

    }

}

/* =========================
   SOUND CONTROL
========================= */

const soundButton =
    document.getElementById(
        "soundButton"
    );


let soundEnabled =
    localStorage.getItem(
        "slotSound"
    ) !== "off";


function updateSoundButton() {

    if (soundEnabled) {

        soundButton.textContent =
            "🔊 Sound ON";

    } else {

        soundButton.textContent =
            "🔇 Sound OFF";

    }

}


function playGameSound(sound) {

    if (!soundEnabled) {
        return;
    }

    playSound(sound);

}


soundButton.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;


        localStorage.setItem(
            "slotSound",
            soundEnabled
                ? "on"
                : "off"
        );


        updateSoundButton();


        /*
         * Give immediate audio feedback
         * when enabling sound.
         */

        if (soundEnabled) {

         //   playGameSound(sounds.spin);

        }

    }
);


updateSoundButton();