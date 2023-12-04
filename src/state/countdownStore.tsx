import { create } from "zustand";
import { cache, getCached } from "../utils/utils";

type TStore = {
  isCountdownActive: boolean;
  setIsCountdownActive: (val: boolean) => void;
  time: string;
  setTime: (time: string) => void;
  updateCountdown: (time: number) => void;
};

const useCountdownStore = create<TStore>((set) => ({
  updateCountdown: (time: number) =>
    set(() => {
      const minutes = Math.floor(time / 60);
      const remainingSeconds = time % 60;

      const parsedTime = `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds,
      ).padStart(2, "0")}`;

      cache({ key: "countdown", data: parsedTime });
      return { time: parsedTime };
    }),
  time: getCached("countdown"),
  setTime: (time: string) => set({ time }),
  isCountdownActive: false,
  setIsCountdownActive: (isCountdownActive: boolean) =>
    set((state) => ({
      ...state,
      isCountdownActive,
    })),
}));

export default useCountdownStore;
