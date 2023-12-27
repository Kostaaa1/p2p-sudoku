import { create } from "zustand";
import { getCached } from "../utils/utils";
import { countdownSet } from "./constants";
import useGameStateStore from "./gameStateStore";

type TStore = {
  isCountdownActive: boolean;
  startingTime: string | null;
  time: string | null;
  actions: {
    setIsCountdownActive: (val: boolean) => void;
    setTime: (time: string) => void;
    updateCountdown: (time: number) => void;
  };
};

const startingTime = localStorage.getItem("countdown");
const difficulty = useGameStateStore.getState().difficulty;

const useCountdownStore = create<TStore>((set) => ({
  startingTime,
  time: difficulty && !getCached("time") ? countdownSet[difficulty] : getCached("time"),
  isCountdownActive: true,
  actions: {
    updateCountdown: (time: number) => {
      const minutes = Math.floor(time / 60);
      const remainingSeconds = time % 60;
      const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
      ).padStart(2, "0")}`;

      set({ time: formattedTime });
    },
    setTime: (time: string) => set({ time }),
    setIsCountdownActive: (isCountdownActive: boolean) =>
      set((state) => ({
        ...state,
        isCountdownActive,
      })),
  },
}));

export default useCountdownStore;
