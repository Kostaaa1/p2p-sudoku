import { create } from "zustand";
import { TAnimationCellType } from "../types/types";

type TAnimationValuesActions = {
  addAnimationRow: () => void;
  addAnimationCol: () => void;
  addAnimationGrid: () => void;
  resetAnimationValues: () => void;
};

type TStoreValues = {
  animationValues: TAnimationCellType[];
  actions: TAnimationValuesActions;
};

const store = create<TStoreValues>((set) => ({
  animationValues: [],
  actions: {
    addAnimationRow: () =>
      set((state) => ({ animationValues: [...state.animationValues, "row"] })),
    addAnimationCol: () =>
      set((state) => ({ animationValues: [...state.animationValues, "col"] })),
    addAnimationGrid: () =>
      set((state) => ({ animationValues: [...state.animationValues, "grid"] })),
    resetAnimationValues: () => set({ animationValues: [] }),
  },
}));

export const useAnimationValues = () => store((state) => state.animationValues);
export const useAnimationValuesActions = () => store((state) => state.actions);
