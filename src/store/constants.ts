import { DifficultySet } from "../types/types";

export const countdownSet: { [key in DifficultySet["data"]]: string } = {
  easy: "10:00",
  medium: "12:00",
  hard: "15:00",
};
