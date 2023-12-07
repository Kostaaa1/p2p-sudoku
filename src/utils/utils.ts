import toast from "react-hot-toast";
import { SudokuCacheMap, SudokuCacheMapKeys } from "../types/types";
import { generateSudokuBoard } from "./generateSudoku";
import { STARTING_TIME } from "../state/constants";

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
        return STARTING_TIME as SudokuCacheMap[T]["data"];
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

export const cache = ({ key, data }: SudokuCacheMap[keyof SudokuCacheMap]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error caching key ${key}`, error);
  }
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
