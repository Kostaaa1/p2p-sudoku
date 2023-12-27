import { create } from "zustand";
import { getCached, getCachedDifficulty } from "../utils/utils";
import { DifficultySet } from "../types/types";

type TUseGameStateStore = {
  isWinner: boolean | null;
  difficulty: DifficultySet["data"];
  actions: {
    setIsWinner: (isWinner: boolean | null) => void;
    setDifficulty: (val: DifficultySet["data"]) => void;
  };
};

const useGameStateStore = create<TUseGameStateStore>((set) => ({
  isWinner: getCached("isWinner") || null,
  difficulty: getCachedDifficulty() || "easy",
  actions: {
    setIsWinner: (isWinner: boolean | null) => set({ isWinner }),
    setDifficulty: (difficulty: DifficultySet["data"] | null) => {
      if (difficulty) {
        localStorage.setItem("difficulty", JSON.stringify(difficulty));
        set({ difficulty });
      }
    },
  },
}));

export default useGameStateStore;
