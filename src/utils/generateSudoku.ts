// import { generate } from "sudoku-core";
// export function generateSudokuBoard(): string[][] {
//   const board = generate("medium");
//   const newBoard = board.map((x) => (!x ? "" : x.toString()));

//   const sudoku2D = Array.from({ length: 9 }, (_, y) =>
//     newBoard.slice(y * 9, y * 9 + 9),
//   );

//   console.log(sudoku2D);
//   return sudoku2D as string[][];
// }

export function generateSudokuBoard() {
  // Initialize a 9x9 Sudoku grid with empty strings
  const sudokuGrid: string[][] = Array.from({ length: 9 }, () =>
    Array(9).fill(""),
  );
  // Fill the diagonal 3x3 subgrids with random numbers
  fillDiagonalSubgrids(sudokuGrid);
  // Solve the Sudoku grid
  solveSudoku(sudokuGrid);
  // Remove some numbers to create the puzzle
  createPuzzle(sudokuGrid);
  return sudokuGrid;
  // return [
  //   ["5", "3", "4", "6", "7", "8", "9", "1", "2"],
  //   ["6", "7", "2", "1", "9", "5", "3", "4", "8"],
  //   ["1", "9", "8", "3", "4", "2", "5", "6", "7"],
  //   ["8", "5", "9", "7", "6", "1", "4", "2", "3"],
  //   ["4", "2", "6", "8", "5", "3", "7", "9", "1"],
  //   ["7", "1", "3", "9", "2", "4", "8", "5", "6"],
  //   ["9", "6", "1", "5", "3", "7", "2", "8", "4"],
  //   ["2", "8", "7", "4", "1", "9", "6", "3", "5"],
  //   ["3", "4", "5", "2", "8", "6", "1", "", ""],
  // ];
}

// Helper function to fill the diagonal 3x3 subgrids
function fillDiagonalSubgrids(grid) {
  for (let i = 0; i < 9; i += 3) {
    fillSubgrid(grid, i, i);
  }
}

// Helper function to fill a 3x3 subgrid with random numbers
function fillSubgrid(grid, row, col) {
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).map(String);

  let index = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      grid[row + i][col + j] = numbers[index];
      index++;
    }
  }
}

// Helper function to shuffle an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Helper function to solve the Sudoku grid
function solveSudoku(grid) {
  // Function to find an empty cell in the grid
  function findEmptyCell() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === "") {
          return [i, j];
        }
      }
    }
    return null;
  }

  // Function to check if a number can be placed in a cell
  function canPlaceNumber(row, col, num) {
    // Check if the number is not in the same row, column, or 3x3 subgrid
    return (
      !grid[row].includes(num) &&
      !grid.map((r) => r[col]).includes(num) &&
      !checkSubgrid(row - (row % 3), col - (col % 3), num)
    );
  }

  // Function to check if a number is in a 3x3 subgrid
  function checkSubgrid(subgridRow, subgridCol, num) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[subgridRow + i][subgridCol + j] === num) {
          return true;
        }
      }
    }
    return false;
  }

  // Recursive function to solve the Sudoku grid using backtracking
  function solve() {
    const emptyCell = findEmptyCell();

    if (!emptyCell) {
      return true; // Sudoku grid is solved
    }

    const [row, col] = emptyCell;

    for (let num = 1; num <= 9; num++) {
      const numString = num.toString();

      if (canPlaceNumber(row, col, numString)) {
        grid[row][col] = numString;

        if (solve()) {
          return true;
        }

        grid[row][col] = ""; // Backtrack
      }
    }

    return false; // No valid number can be placed in this cell
  }

  solve();
}

// Helper function to create a Sudoku puzzle by removing numbers
function createPuzzle(grid) {
  // Function to determine the difficulty level
  // Function to remove numbers based on difficulty level
  function removeNumbers(difficultyLevel) {
    let removalCount;
    switch (difficultyLevel) {
      case "easy":
        removalCount = 40;
        break;
      case "medium":
        removalCount = 50;
        break;
      case "hard":
        removalCount = 70;
        break;
      default:
        removalCount = 50;
    }

    for (let i = 0; i < removalCount; i++) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      grid[row][col] = "";
    }
  }

  removeNumbers("hard");
}
