import { create } from "zustand";
import { TAnimationCellType } from "../types/types";

type TAnimationValuesActions = {
  addAnimationValue: (type: TAnimationCellType) => void;
  resetAnimationValues: () => void;
};

type TStoreValues = {
  animationValues: TAnimationCellType[];
  actions: TAnimationValuesActions;
};

const store = create<TStoreValues>((set) => ({
  animationValues: [],
  actions: {
    addAnimationValue: (type: TAnimationCellType) =>
      set((state) => ({ animationValues: [type, ...state.animationValues] })),
    resetAnimationValues: () => set({ animationValues: [] }),
  },
}));

export const useAnimationValues = () => store((state) => state.animationValues);
export const useAnimationValuesActions = () => store((state) => state.actions);
