//DOM Manipulation
const flipButton = document.querySelector("#flip-button");
const optionContainer = document.querySelector(".option-container");
const gameContainer = document.querySelector("#gameboard-container");
const startButton = document.querySelector("#start-button");
const infoDisplay = document.querySelector("#info");
const turnDisplay = document.querySelector("#turn-display");
const optionShips = Array.from(optionContainer.children);
///////////////////////////////////////////

// functions
// create a board
let width = 10;
function createBoard(color, user) {
  const gameBoard = document.createElement("div");
  gameBoard.classList.add("board");
  gameBoard.style.backgroundColor = color;
  gameBoard.id = user;
  gameContainer.append(gameBoard);
  for (let i = 0; i < width * width; i++) {
    let cell = document.createElement("div");
    cell.id = i;
    cell.classList.add("cell");
    gameBoard.append(cell);
  }
}

// flip the ships horiontally or vertically
let angle = 0;
function flip() {
  angle = angle === 0 ? 90 : 0;
  optionShips.forEach((optionShip) => {
    optionShip.style.transform = `rotate(${angle}deg)`;
  });
}

//creating ships using a class

// event listeners
flipButton.addEventListener("click", flip);
// calling functions

createBoard("grey", "player");
createBoard("white", "computer");

class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

const destroyer = new Ship("destroyer", 2);
const submarine = new Ship("submarine", 3);
const cruiser = new Ship("cruiser", 4);
const battleship = new Ship("battleship", 5);
const carrier = new Ship("carrier", 6);
const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;

function getValidity(allBoardCells, isHorizontal, startIndex, ship) {
  let validStart = isHorizontal
    ? startIndex <= width * width - ship.length
      ? startIndex
      : width * width - ship.length
    : startIndex <= width * width - width * ship.length
    ? startIndex
    : startIndex - ship.length * width + width;

  validStart = Math.max(validStart, 0);

  let shipCells = [];

  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipCells.push(allBoardCells[Number(validStart) + i]);
    } else {
      shipCells.push(allBoardCells[Number(validStart) + i * width]);
    }
  }

  let valid;

  if (isHorizontal) {
    shipCells.every(
      (_shipCell, index) =>
        (valid =
          shipCells[0].id % width !== width - (shipCells.length - (index + 1)))
    );
  } else {
    shipCells.every((_shipCell, index) => {
      valid = shipCells[0].id < 90 + (width * index + 1);
    });
  }

  let notTaken = shipCells.every(
    (shipCell) => !shipCell.classList.contains("taken")
  );
  return { shipCells, valid, notTaken };
}

function addShipToBoard(user, ship, startId) {
  const allBoardCells = document.querySelectorAll(`#${user} div`);
  let randomBoolean = Math.random() < 0.5;
  let isHorizontal = user === "player" ? angle === 0 : randomBoolean;
  let randomStartIndex = Math.floor(Math.random() * width * width);
  let startIndex = startId ? startId : randomStartIndex;
  const { shipCells, valid, notTaken } = getValidity(
    allBoardCells,
    isHorizontal,
    startIndex,
    ship
  );

  if (valid && notTaken) {
    shipCells.forEach((shipCell) => {
      shipCell.classList.add(ship.name);
      shipCell.classList.add("taken");
    });
  } else {
    // in case of the user is computer if it is not valid or taken pass run the function again to generate another startId

    if (user === "computer") addShipToBoard(user, ship, startId);
    // if it is the player then tell him to drag again

    if (user === "player") {
      notDropped = true;
    }
  }
}

ships.forEach((ship) => addShipToBoard("computer", ship));
//////////

//dragging
//drag starts with the targetted ship
optionShips.forEach((optionShip) =>
  optionShip.addEventListener("dragstart", dragStart)
);

//then the destination which is the player board
// first we drag over then we drop the ship
const allPlayerCells = document.querySelectorAll("#player div");
allPlayerCells.forEach((playerCell) => {
  playerCell.addEventListener("dragover", dragOver);
  playerCell.addEventListener("drop", dropShip);
});
let draggedShip;
function dragStart(e) {
  //it tells me which ship I am dragging
  // and it passes "notDragged" in a false state preparing it for the dropShip function
  notDropped = false;
  draggedShip = e.target;
}

function dragOver(e) {
  e.preventDefault();
  const ship = ships[draggedShip.id];
  const startId = e.target.id;
  addHighlight(startId, ship);
}
// to drop the ship we need to determine the coordinates which is the start id
// then the ship which we targeted with the dragStart function
function dropShip(e) {
  const startId = e.target.id;

  const ship = ships[draggedShip.id];
  addShipToBoard("player", ship, startId);
  if (!notDropped) {
    //if dropped
    draggedShip.remove();
  }
}
// ///////////////////
function addHighlight(startIndex, ship) {
  const allBoardCells = document.querySelectorAll("#player div");
  let isHorizontal = angle === 0;
  const { shipCells, valid, notTaken } = getValidity(
    allBoardCells,
    isHorizontal,
    startIndex,
    ship
  );
  if (valid && notTaken) {
    shipCells.forEach((shipCell) => {
      shipCell.classList.add("hover");
      setTimeout(() => shipCell.classList.remove("hover"), 500);
    });
  }
}

////
//game logic
// start game
function startGame() {
  if (playerTurn === undefined) {
    if (optionContainer.children.length != 0) {
      infoDisplay.textContent = "Please drag all the ships";
    } else {
      const allComputerCells = document.querySelectorAll("#computer div");
      allComputerCells.forEach((cell) =>
        cell.addEventListener("click", handleClick)
      );
    }
    playerTurn = true;
    turnDisplay.textContent = "your turn";
  }
}

startButton.addEventListener("click", startGame);
let gameOver = false;
let playerTurn;
let playerHits = [];
let computerHits = [];
const playerSunkShips = [];
const computerSunkShips = [];
function handleClick(e) {
  if (!gameOver) {
    if (e.target.classList.contains("taken")) {
      e.target.classList.add("boom");
      infoDisplay.textContent = " You hit the computer's ship";
      let classes = Array.from(e.target.classList);
      // keep all classes except for

      classes = classes.filter((className) => className !== "cell");
      classes = classes.filter((className) => className !== "boom");
      classes = classes.filter((className) => className !== "taken");
      playerHits.push(...classes);
      checkScore("player", playerHits, playerSunkShips);
    }
    if (!e.target.classList.contains("taken")) {
      infoDisplay.textContent = "oops that was not a ship";
      e.target.classList.add("empty");
    }
    playerTurn = false;
    const allComputerCells = document.querySelectorAll("#computer div");
    // remove the event listener
    allComputerCells.forEach((cell) => cell.replaceWith(cell.cloneNode(true)));
    setTimeout(computerGo, 3000);
  }
}

function computerGo() {
  if (!gameOver) {
    turnDisplay.textContent = "compute's turn";
    infoDisplay.textContent = "waiting for the computer to hit";

    setTimeout(() => {
      let randomGo = Math.floor(Math.random() * width * width);

      const allPlayerCells = document.querySelectorAll("#player div");
      if (
        allPlayerCells[randomGo].classList.contains("taken") &&
        allPlayerCells[randomGo].classList.contains("boom")
      ) {
        computerGo();
        return;
      } else if (
        allPlayerCells[randomGo].classList.contains("taken") &&
        !allPlayerCells[randomGo].classList.contains("boom")
      ) {
        allPlayerCells[randomGo].classList.add("boom");
        infoDisplay.textContent = "ops your ship was hit";

        let classes = Array.from(allPlayerCells[randomGo].classList);
        // keep all classes except for

        classes = classes.filter((className) => className !== "cell");
        classes = classes.filter((className) => className !== "boom");
        classes = classes.filter((className) => className !== "taken");
        computerHits.push(...classes);
        checkScore("computer", computerHits, computerSunkShips);
      } else {
        infoDisplay.textContent = "your ships are safe this time";

        allPlayerCells[randomGo].classList.add("empty");
      }
    }, 3000);

    setTimeout(() => {
      playerTurn = true;
      turnDisplay.textContent = "your turn";
      playerTurn = true;
      const allComputerCells = document.querySelectorAll("#computer div");
      allComputerCells.forEach((cell) =>
        cell.addEventListener("click", handleClick)
      );
    }, 6000);
  }
}

function checkScore(user, userHits, userSunkShips) {
  function checkShip(shipName, shipLength) {
    if (
      userHits.filter((storedShipName) => storedShipName === shipName)
        .length === shipLength
    ) {
      infoDisplay.textContent = `${shipName} was sunk by ${user}`;
      if (user === "player") {
        playerHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName
        );
      }
      if (user === "computer") {
        computerHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName
        );
      }
      userSunkShips.push(shipName);
    }
  }

  checkShip("destroyer", 2);
  checkShip("submarine", 3);
  checkShip("cruiser", 4);
  checkShip("battleship", 5);
  checkShip("carrier", 6);

  if (playerSunkShips.length === 5) {
    infoDisplay.textContent = "You won! you hit all the computer's ships";
    gameOver = true;
  }

  if (computerSunkShips.length === 5) {
    infoDisplay.textContent = "You lost! try again";
    gameOver = true;
  }
}
