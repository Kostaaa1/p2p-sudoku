import { create } from "zustand";
import { cache, getCached } from "../utils/utils";

type TStore = {
  isCountdownActive: boolean;
  setIsCountdownActive: (val: boolean) => void;
  time: string;
  setTime: (time: string) => void;
  updateCountdown: (time: number) => void;
  startingTime: string | null;
  setStartingTime: (time: string) => void;
};

const useCountdownStore = create<TStore>((set) => ({
  startingTime: null,
  setStartingTime: (time: string) => set({ startingTime: `${time}:00` }),
  updateCountdown: (time: number) => {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;

    const parsedTime = `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
    cache({ key: "countdown", data: parsedTime });

    set({ time: parsedTime });
  },
  time: getCached("countdown"),
  setTime: (time: string) => {
    set({ time });
  },
  isCountdownActive: false,
  setIsCountdownActive: (isCountdownActive: boolean) =>
    set((state) => ({
      ...state,
      isCountdownActive,
    })),
}));

export default useCountdownStore;
