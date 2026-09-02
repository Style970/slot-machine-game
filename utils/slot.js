const symbols = [{
  icon: "🍒",
  // multiplier: 100
  multiplier: 1
},

  {
    icon: "🍋",
    // multiplier: 80
    multiplier: 2
  },

  {
    icon: "🍊",
    // multiplier: 60
    multiplier: 3
  },

  {
    icon: "🍉",
   // multiplier: 50
   multiplier: 4
  },

  {
    icon: "⭐",
    //multiplier: 150
    multiplier: 5
  },

  {
    icon: "💎",
   // multiplier: 500
   multiplier: 10
  }];


const paylines = [

  [0, 0, 0, 0, 0],

  [1, 1, 1, 1, 1],

  [2, 2, 2, 2, 2],

  [0, 1, 2, 1, 0],

  [2, 1, 0, 1, 2],

  [0, 0, 1, 0, 0],

  [2, 2, 1, 2, 2],

  [1, 0, 0, 0, 1],

  [1, 2, 2, 2, 1],

  [0, 1, 1, 1, 0],

  [2, 1, 1, 1, 2],

  [1, 1, 0, 1, 1],

  [1, 1, 2, 1, 1],

  [0, 2, 0, 2, 0],

  [2, 0, 2, 0, 2],

  [0, 2, 2, 2, 0],

  [2, 0, 0, 0, 2],

  [0, 1, 2, 2, 2],

  [2, 1, 0, 0, 0],

  [1, 0, 1, 2, 1]

];


function randomSymbol() {

  return symbols[
    Math.floor(
      Math.random() *
      symbols.length
    )
  ];

}


function randomGrid() {

  const grid = [];

  for (
    let reel = 0;
    reel < 5;
    reel++
  ) {

    grid[reel] = [];

    for (
      let row = 0;
      row < 3;
      row++
    ) {

      grid[reel][row] =
      randomSymbol().icon;

    }

  }

  return grid;

}


function checkPaylines(grid) {

  const wins = [];

  paylines.forEach(
    (line, lineIndex) => {

      const first =
      grid[0][line[0]];

      let count = 1;

      for (
        let reel = 1;
        reel < 5;
        reel++
      ) {

        if (
          grid[reel][line[reel]] ===
          first
        ) {

          count++;

        } else {

          break;

        }

      }


      if (count >= 3) {

        const symbol =
        symbols.find(
          item =>
          item.icon === first
        );


        wins.push({

          line:
          lineIndex + 1,

          symbol:
          first,

          count,

          multiplier:
          symbol.multiplier

        });

      }

    }
  );

  return wins;

}


function createWinningGrid() {

  let grid =
  randomGrid();


  const lineIndex =
  Math.floor(
    Math.random() *
    paylines.length
  );


  const line =
  paylines[lineIndex];


  const symbol =
  randomSymbol();


  const roll =
  Math.random();


  let count;


  if (roll < 0.55) {

    count = 3;

  } else if (roll < 0.85) {

    count = 4;

  } else {

    count = 5;

  }


  for (
    let reel = 0;
    reel < count;
    reel++
  ) {

    const row =
    line[reel];

    grid[reel][row] =
    symbol.icon;

  }


  return grid;

}


function createLosingGrid() {

  let grid;

  let attempts = 0;


  do {

    grid =
    randomGrid();

    attempts++;

  }
  while (
    checkPaylines(grid).length > 0 &&
    attempts < 100
  );


  return grid;

}


function generateResult(
  winPercentage
) {

  const roll =
  Math.random() * 100;


  if (
    roll < winPercentage
  ) {

    return createWinningGrid();

  }


  return createLosingGrid();

}


function calculateWinnings(
  wins,
  bet
) {

  let total = 0;


  for (const win of wins) {

    let factor;


    if (win.count === 3) {

      factor = 0.25;

    } else if (win.count === 4) {

      factor = 0.50;

    } else {

      factor = 1;

    }


    total += Math.floor(
      bet *
      win.multiplier *
      factor
    );

  }


  return total;

}


module.exports = {

  generateResult,

  checkPaylines,

  calculateWinnings,

  paylines,

  symbols

};