// import { generate } from "sudoku-core";
// export function generateSudokuBoard(): string[][] {
//   const board = generate("medium");
//   const newBoard = board.map((x) => (!x ? "" : x));

//   const sudoku2D = Array.from({ length: 9 }, (_, y) =>
//     newBoard.slice(y * 9, y * 9 + 9),
//   );

//   return sudoku2D as string[][];
// }

export function generateSudokuBoard(): string[][] {
  // Initialize an empty 9x9 Sudoku board
  const board = Array.from({ length: 9 }, () => Array(9).fill(""));

  // Helper function to check if a value is valid in a given position
  function isValid(board: string[][], row: number, col: number, num: string) {
    // Check if the number is not in the current row and column
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) {
        return false;
      }
    }

    // Check if the number is not in the 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) {
          return false;
        }
      }
    }

    return true;
  }

  // Helper function to solve the Sudoku puzzle using backtracking
  function solveSudoku(board: string[][]) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === "") {
          for (let num = 1; num <= 9; num++) {
            const numStr = num.toString();
            if (isValid(board, row, col, numStr)) {
              board[row][col] = numStr;
              if (solveSudoku(board)) {
                return true;
              }
              board[row][col] = ""; // Backtrack if the current placement is not valid
            }
          }
          return false; // No valid number found for this cell
        }
      }
    }
    return true;
  }

  solveSudoku(board);

  let count = 0;
  while (count < 38) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== "") {
      board[row][col] = "";
      count++;
    }
  }

  return board;
}
