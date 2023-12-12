import toast from "react-hot-toast";
import { DifficultySet, TParsedGameCache } from "../types/types";

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

export const cacheMainGame = (data: TParsedGameCache) => {
  localStorage.setItem("main_game", JSON.stringify(data));
};

export const getCachedMainGame = (): string | null => {
  const game = localStorage.getItem("main_game");
  return game;
};

export const cacheDifficulty = (diff: DifficultySet["data"]) => {
  localStorage.setItem("difficulty", JSON.stringify(diff));
};

export const getCachedDifficulty = (): DifficultySet["data"] | null => {
  const diff = localStorage.getItem("difficulty");
  return diff ? (JSON.parse(diff) as DifficultySet["data"]) : null;
};
