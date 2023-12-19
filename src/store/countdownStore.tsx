import { create } from "zustand";
import { getCached } from "../utils/utils";
import useSudokuStore from "./sudokuStore";
import { countdownSet } from "./constants";

type TStore = {
  isCountdownActive: boolean;
  setIsCountdownActive: (val: boolean) => void;
  time: string | null;
  setTime: (time: string) => void;
  updateCountdown: (time: number) => void;
  startingTime: string | null;
};

const startingTime = localStorage.getItem("countdown");

const difficulty = useSudokuStore.getState().difficulty;

const useCountdownStore = create<TStore>((set) => ({
  startingTime,
  updateCountdown: (time: number) => {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;

    const parsedTime = `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;

    set({ time: parsedTime });
  },
  time:
    difficulty && !getCached("time")
      ? countdownSet[difficulty]
      : getCached("time"),
  setTime: (time: string) => set({ time }),
  isCountdownActive: true,
  setIsCountdownActive: (isCountdownActive: boolean) =>
    set((state) => ({
      ...state,
      isCountdownActive,
    })),
}));

export default useCountdownStore;
