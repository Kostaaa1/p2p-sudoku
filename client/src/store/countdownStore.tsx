import { create } from "zustand";
import { getCached } from "../utils/utils";
import { countdownSet } from "./constants";
import useGameStateStore from "./gameStateStore";
import { DifficultySet } from "../types/types";

type TStore = {
  isCountdownActive: boolean;
  time: number;
  actions: {
    decrementTime: () => void;
    setIsCountdownActive: (val: boolean) => void;
    setTime: (diff: DifficultySet["data"]) => void;
    updateCountdown: (time: number) => void;
  };
};

const difficulty = useGameStateStore.getState().difficulty;

const useCountdownStore = create<TStore>((set) => ({
  time: !getCached("time") ? countdownSet[difficulty] : getCached("time"),
  isCountdownActive: true,
  actions: {
    decrementTime: () => set((state) => ({ time: state.time - 1 })),
    setTime: (difficulty: DifficultySet["data"]) =>
      set({ time: countdownSet[difficulty] }),
    updateCountdown: (time: number) => set({ time }),
    setIsCountdownActive: (isCountdownActive: boolean) =>
      set((state) => ({
        ...state,
        isCountdownActive,
      })),
  },
}));

export default useCountdownStore;
