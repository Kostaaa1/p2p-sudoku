import { create } from "zustand";
import { getCached } from "../utils/utils";

type TUseMistakesActions = {
  incrementMistakes: () => void;
  resetMistakes: () => void;
  setMistakes: (n: number) => void;
};

type TUseMistakes = {
  mistakes: number;
  actions: TUseMistakesActions;
};

const useMistakesStore = create<TUseMistakes>((set) => ({
  mistakes: getCached("mistakes") || 0,
  actions: {
    resetMistakes: () => set({ mistakes: 0 }),
    setMistakes: (mistakes: number) => set({ mistakes }),
    incrementMistakes: () => set((state) => ({ ...state, mistakes: state.mistakes + 1 })),
  },
}));

export default useMistakesStore;
