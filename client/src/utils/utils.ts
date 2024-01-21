import {
  DifficultySet,
  TCell,
  TFocusedCell,
  TUnifiedGame,
} from "../types/types";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getCached = (key: keyof TUnifiedGame) => {
  const storedGame = localStorage.getItem("main_game");
  return storedGame ? JSON.parse(storedGame)[key] : null;
};

export const getCachedDifficulty = (): DifficultySet["data"] | null => {
  const diff = localStorage.getItem("difficulty");
  return diff ? (JSON.parse(diff) as DifficultySet["data"]) : null;
};

export const isCellIncludedInStack = (stack: TCell[], cell: TCell) => {
  const { col, row, value } = cell;
  return stack.some(
    (obj) => obj.row === row && obj.col === col && obj.value === value,
  );
};

export const formatCountdown = (time: number) => {
  const minutes = Math.floor(time / 60);
  const remainingSeconds = time % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;

  return formattedTime;
};

export const isObjectEqual = (
  o1: TCell | TFocusedCell,
  o2: TCell | TFocusedCell,
): boolean => {
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
