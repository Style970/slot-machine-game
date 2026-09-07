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


const PAYLINES = [

  [0, 0, 0, 0, 0],//0

  [1, 1, 1, 1, 1],//1

  [2, 2, 2, 2, 2],//2

  [0, 1, 2, 1, 0],//3

  [2, 1, 0, 1, 2],//4

  [0, 0, 1, 0, 0],//5

  [2, 2, 1, 2, 2],//6

  [1, 0, 0, 0, 1],//7

  [1, 2, 2, 2, 1],//8

  [0, 1, 1, 1, 0],//9

  [2, 1, 1, 1, 2],//10

  [1, 1, 0, 1, 1],//11

  [1, 1, 2, 1, 1],//12

  [0, 2, 0, 2, 0],//13

  [2, 0, 2, 0, 2],//14

  [0, 2, 2, 2, 0],//15

  [2, 0, 0, 0, 2],//16

  [0, 1, 2, 2, 2],//17

  [2, 1, 0, 0, 0],//18

  [1, 0, 1, 2, 1]//19

];

// 5 reels × 3 rows
// row: 0 = top, 1 = middle, 2 = bottom

const paylines = [
  // 1. Straight middle
  [1, 1, 1, 1, 1],

  // 2. Straight top
  [0, 0, 0, 0, 0],

  // 3. Straight bottom
  [2, 2, 2, 2, 2],

  // 4. V shape
  [0, 1, 2, 1, 0],

  // 5. Inverted V
  [2, 1, 0, 1, 2],

  // 6. Top → middle → top
  [0, 0, 1, 0, 0],

  // 7. Bottom → middle → bottom
  [2, 2, 1, 2, 2],

  // 8. Middle → top → middle
  [1, 0, 0, 0, 1],

  // 9. Middle → bottom → middle
  [1, 2, 2, 2, 1],

  // 10. Top → middle → middle → middle → top
  [0, 1, 1, 1, 0],

  // 11. Bottom → middle → middle → middle → bottom
  [2, 1, 1, 1, 2],

  // 12. Top zig-zag
  [0, 1, 0, 1, 0],

  // 13. Bottom zig-zag
  [2, 1, 2, 1, 2],

  // 14. Middle → top → middle → top → middle
  [1, 0, 1, 0, 1],

  // 15. Middle → bottom → middle → bottom → middle
  [1, 2, 1, 2, 1],

  // 16. Top → top → middle → bottom → bottom
  [0, 0, 1, 2, 2],

  // 17. Bottom → bottom → middle → top → top
//  [2, 2, 1, 0, 0],

  // 18. Top → middle → top → middle → top
  [0, 1, 0, 1, 0],

  // 19. Bottom → middle → bottom → middle → bottom
  [2, 1, 2, 1, 2],

  // 20. Middle → middle → top → middle → middle
  [1, 1, 0, 1, 1]
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
          lineIndex,

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

  if (roll < 0.50) {

    count = 3;

  } else if (roll < 0.80) {

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

 // agar winPercentage ki value 
  if (
    roll < winPercentage
  ) {

    return createWinningGrid();

  }


  return createLosingGrid();

}

// yahan se win price calculate hoga
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


/* =========================
   CLEAR WINS
========================= */


module.exports = {

  generateResult,

  checkPaylines,

  calculateWinnings,

  paylines,

  symbols,
  
};