import { DifficultySet } from "../types/types";

export const countdownSet: { [key in DifficultySet["data"]]: string } = {
  Easy: "10:00",
  Medium: "12:00",
  Hard: "15:00",
};
