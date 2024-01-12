import { create } from "zustand";
import { getCached } from "../utils/utils";
import { countdownSet } from "./constants";
import useGameStateStore from "./gameStateStore";
import { DifficultySet } from "../types/types";

type TStore = {
  isCountdownActive: boolean;
  startingTime: string | null;
  time: number | null;
  // seconds: number | null;
  actions: {
    decrementCountdown: () => void;
    setIsCountdownActive: (val: boolean) => void;
    setTime: (diff: DifficultySet["data"]) => void;
    updateCountdown: (time: number) => void;
  };
};

const startingTime = localStorage.getItem("countdown");
const difficulty = useGameStateStore.getState().difficulty;

const useCountdownStore = create<TStore>((set) => ({
  // seconds: !getCached("time") ? secondSet[difficulty] : getCached("time"),
  startingTime,
  time: !getCached("time") ? countdownSet[difficulty] : getCached("time"),
  isCountdownActive: true,
  actions: {
    decrementCountdown: () =>
      set((state) => {
        return state.time ? { time: state.time - 1 } : state;
      }),
    setTime: (difficulty: DifficultySet["data"]) => {
      console.log("setTime ran: ", difficulty);
      set({ time: countdownSet[difficulty] });
    },
    updateCountdown: (time: number) => set({ time }),
    setIsCountdownActive: (isCountdownActive: boolean) =>
      set((state) => ({
        ...state,
        isCountdownActive,
      })),
  },
}));

export default useCountdownStore;
