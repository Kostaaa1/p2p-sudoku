export function generateSudokuBoard(): string[][] {
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
}

function fillDiagonalSubgrids(grid: string[][]) {
  for (let i = 0; i < 9; i += 3) {
    fillSubgrid(grid, i, i);
  }
}

function fillSubgrid(grid: string[][], row: number, col: number) {
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).map(String);

  let index = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      grid[row + i][col + j] = numbers[index];
      index++;
    }
  }
}

function shuffle(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function solveSudoku(grid: string[][]) {
  function findEmptyCell(): [number, number] | null {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === "") {
          return [i, j];
        }
      }
    }
    return null;
  }

  function canPlaceNumber(row: number, col: number, num: string): boolean {
    return (
      !grid[row].includes(num) &&
      !grid.map((r) => r[col]).includes(num) &&
      !checkSubgrid(row - (row % 3), col - (col % 3), num)
    );
  }

  function checkSubgrid(
    subgridRow: number,
    subgridCol: number,
    num: string,
  ): boolean {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[subgridRow + i][subgridCol + j] === num) {
          return true;
        }
      }
    }
    return false;
  }

  function solve(): boolean {
    const emptyCell = findEmptyCell();

    if (!emptyCell) {
      return true;
    }

    const [row, col] = emptyCell;

    for (let num = 1; num <= 9; num++) {
      const numString = num.toString();

      if (canPlaceNumber(row, col, numString)) {
        grid[row][col] = numString;

        if (solve()) {
          return true;
        }

        grid[row][col] = "";
      }
    }

    return false;
  }

  solve();
}

function createPuzzle(grid: string[][]) {
  function removeNumbers(difficultyLevel: "easy" | "medium" | "hard") {
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
        removalCount = 70;
    }

    for (let i = 0; i < removalCount; i++) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      grid[row][col] = "";
    }
  }

  removeNumbers("hard");
}
