import toast from "react-hot-toast";
import { SudokuCache, SudokuCacheTypes } from "../types/types";

// Need to add sudoku generator and sudoku solver, it is not easy. I need to understand it.
export const getCached = (key: SudokuCacheTypes) => {
  const cachedAdded = localStorage.getItem(key);

  if (cachedAdded) {
    return JSON.parse(cachedAdded);
  } else {
    switch (key) {
      case "added":
      case "invalid":
        return [];
      case "mistakes":
        return 0;
      case "countdown":
        return "15:00";
      case "game":
        return getSudokuGameBoard();
      default:
        return null;
    }
  }
};

//cache local storage
export const cache = ({ key, data }: SudokuCache) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error caching key ${key}`, error);
  }
};

export const updateCountdown = (
  time: number,
  setTime: (time: string) => void
) => {
  const minutes = Math.floor(time / 60);
  const remainingSeconds = time % 60;

  const parsedTime = `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;

  cache({ key: "countdown", data: parsedTime });
  setTime(parsedTime);
};

export const toastMessageConstructor = ({
  winner,
  message,
}: {
  winner: boolean;
  message: string;
}) => {
  const emoji = winner ? "🎉🎉🎉" : "😢😢😢";
  const newMessage = `${emoji}${message}${emoji}`;
  toast(newMessage);
};

const getSudokuGameBoard = () => {
  return [
    ["", "9", "4", "1", "", "", "5", "", "7"],
    ["", "7", "", "", "8", "", "", "", ""],
    ["", "", "6", "", "", "4", "1", "2", ""],
    ["", "", "1", "", "", "", "", "", "2"],
    ["", "", "", "8", "6", "", "9", "7", ""],
    ["", "6", "", "2", "", "7", "", "", ""],
    ["2", "3", "", "4", "1", "8", "7", "", "6"],
    ["6", "4", "", "7", "", "5", "3", "1", "9"],
    ["5", "1", "", "", "9", "", "", "", ""],
  ];
};

// Sudoku solver:
// Sudoku validator:
// const validateSudoku = (sudoku: string[][]) => {
//   for (let i = 0; i < 9; i++) {
//     const rowSet = new Set();
//     const colSet = new Set();
//     const gridSet = new Set();
//     for (let j = 0; j < 9; j++) {
//       const rowValue = sudoku[i][j];
//       const colValue = sudoku[j][i];
//       const gridValue =
//         sudoku[Math.floor(i / 3) * 3 + Math.floor(j / 3)][
//           3 * (i % 3) + (j % 3)
//         ];
//       if (rowValue !== "") {
//         if (rowSet.has(rowValue)) {
//           return false;
//         }
//         rowSet.add(rowValue);
//       }
//       if (colValue !== "") {
//         if (colSet.has(colValue)) {
//           return false;
//         }
//         colSet.add(colValue);
//       }
//       if (gridValue !== "") {
//         if (gridSet.has(gridValue)) {
//           return false;
//         }
//       }
//       gridSet.add(gridValue);
//     }
//   }
//   return true;
// };
