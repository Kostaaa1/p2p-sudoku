import toast from "react-hot-toast";
import { SudokuCacheMap, SudokuCacheMapKeys } from "../types/types";
import { generateSudokuBoard } from "./generateSudoku";

// Need to add sudoku generator and sudoku solver, it is not easy. I need to understand it.
export const getCached = <T extends SudokuCacheMapKeys>(
  key: T,
): SudokuCacheMap[T]["data"] => {
  1;
  const cachedAdded = localStorage.getItem(key);

  if (cachedAdded) {
    return JSON.parse(cachedAdded);
  } else {
    switch (key) {
      case "added":
      case "invalid":
        return [] as SudokuCacheMap[T]["data"];
      case "mistakes":
        return 0 as SudokuCacheMap[T]["data"];
      case "countdown":
        return "00:30" as SudokuCacheMap[T]["data"];
      case "is_winner":
        return null as SudokuCacheMap[T]["data"];
      case "game": {
        const board = generateSudokuBoard();
        cache({ key: "game", data: board });
        return board as SudokuCacheMap[T]["data"];
      }
      default:
        return "";
    }
  }
};

//cache local storage
export const cache = ({ key, data }: SudokuCacheMap[keyof SudokuCacheMap]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error caching key ${key}`, error);
  }
};

// export const updateCountdown = (
//   time: number,
//   setTime: (time: string) => void
// ) => {
//   const minutes = Math.floor(time / 60);
//   const remainingSeconds = time % 60;

//   const parsedTime = `${String(minutes).padStart(2, "0")}:${String(
//     remainingSeconds
//   ).padStart(2, "0")}`;

//   cache({ key: "countdown", data: parsedTime });
//   setTime(parsedTime);
// };

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

// const getSudokuGameBoard = () => {
//   return [
//     ["", "9", "4", "1", "", "", "5", "", "7"],
//     ["", "7", "", "", "8", "", "", "", ""],
//     ["", "", "6", "", "", "4", "1", "2", ""],
//     ["", "", "1", "", "", "", "", "", "2"],
//     ["", "", "", "8", "6", "", "9", "7", ""],
//     ["", "6", "", "2", "", "7", "", "", ""],
//     ["2", "3", "", "4", "1", "8", "7", "", "6"],
//     ["6", "4", "", "7", "", "5", "3", "1", "9"],
//     ["5", "1", "", "", "9", "", "", "", ""],
//   ];
// };

// Sudoku validator:
// const validateSudoku = (sudoku: string[][]) => {
//   for (let i = 0; i < 9; i++) {
//     const rowSet = new Set();
//     const colSet = new Set();
//     const gridSet = new Set();
//
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
