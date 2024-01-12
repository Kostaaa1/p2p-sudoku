import { DifficultySet } from "../types/types";

export const countdownSet: { [key in DifficultySet["data"]]: number } = {
  easy: 600,
  medium: 720,
  hard: 900,
};

export const emptySudoku = Array.from({ length: 9 }, () =>
  Array.from({ length: 9 }, () => ""),
);
