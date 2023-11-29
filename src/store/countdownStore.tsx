import { create } from "zustand";
import { getCached } from "../utils/utils";

type TStore = {
  isCountdownActive: boolean;
  setIsCountdownActive: (val: boolean) => void;
  time: string;
  setTime: (time: string) => void;
};

const startingTime = getCached("countdown");

const useCountdownStore = create<TStore>((set) => ({
  //// Countdown:
  time: startingTime,
  setTime: (time: string) => set({ time }),
  isCountdownActive: true,
  setIsCountdownActive: (isCountdownActive: boolean) =>
    set((state) => ({
      ...state,
      isCountdownActive,
    })),
}));

export default useCountdownStore;
