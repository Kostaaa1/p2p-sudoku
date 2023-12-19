import toast from "react-hot-toast";
import { DifficultySet, TCell, TParsedGameCache } from "../types/types";
import { keys } from "lodash";

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

export const getCached = (key: keyof TParsedGameCache) => {
  const storedGame = localStorage.getItem("main_game");
  return storedGame ? JSON.parse(storedGame)[key] : null;
};

export const getCachedDifficulty = (): DifficultySet["data"] | null => {
  const diff = localStorage.getItem("difficulty");
  return diff ? (JSON.parse(diff) as DifficultySet["data"]) : null;
};

export const isCellIncludedInStack = (stack: TCell[], cell: TCell) => {
  const { col, row, value } = cell;
  return stack.some((x) => x.row === row && x.col === col && x.value === value);
};

const isObjectEqual = (o1: TCell, o2: TCell): boolean => {
  const keys1 = Object.keys(o1) as (keyof TCell)[];
  const keys2 = Object.keys(o2) as (keyof TCell)[];

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => o1[key] === o2[key]);
};

export const isArrayEqual = (arr1: TCell[], arr2: TCell[]) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!isObjectEqual(arr1[i], arr2[i])) return false;
  }
  return true;
};
