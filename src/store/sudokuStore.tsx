import { create } from "zustand";
import { TCell } from "../types/types";
import { cache, getCached } from "../utils/utils";
import useCountdownStore from "./countdownStore";

type TUseSudokuStore = {
  sudoku: string[][];
  setSudoku: (board: string[][]) => void;
  invalidCells: TCell[];
  setInvalidCells: (cell: TCell[]) => void;
  addInvalidCell: (cell: TCell) => void;
  addedCells: TCell[];
  setAddedCells: (cell: TCell[]) => void;
  focusedCell: TCell;
  setFocusedCell: (cell: TCell) => void;
  isWinner: null | boolean;
  setIsWinner: (isWinner: boolean | null) => void;
  mistakes: number;
  incrementMistakes: () => void;
  resetMistakes: () => void;
  INIT_INVALID_CELLS_STRING: string | null;
  resetGame: () => void;
};

const useSudokuStore = create<TUseSudokuStore>((set) => ({
  INIT_INVALID_CELLS_STRING: localStorage.getItem("invalid"),
  resetGame: () =>
    set((state) => {
      localStorage.clear();
      useCountdownStore.setState({ isCountdownActive: false, time: "15:00" });

      return {
        ...state,
        invalidCells: [],
        addedCells: [],
        mistakes: 0,
        sudoku: getCached("game"),
        isWinner: state.isWinner !== null ? null : state.isWinner,
      };
    }),
  sudoku: getCached("game"),
  setSudoku: (sudoku: string[][]) =>
    set(() => {
      cache({ key: "game", data: sudoku });
      return { sudoku };
    }),
  focusedCell: { col: 0, row: 0, value: getCached("game")[0][0] },
  setFocusedCell: (focusedCell: TCell) => set({ focusedCell }),
  invalidCells: getCached("invalid"),
  setInvalidCells: (cells: TCell[]) =>
    set(() => {
      cache({ key: "invalid", data: cells });
      return { invalidCells: cells };
    }),
  addInvalidCell: (data: TCell) =>
    set((state) => {
      const condition = !state.invalidCells.some(
        (x) =>
          x.col === data.col && x.row === data.row && x.value === data.value
      );

      if (condition) {
        const updateddCells = [data, ...state.invalidCells];
        cache({ key: "invalid", data: updateddCells });
        return { invalidCells: updateddCells };
      } else {
        return state;
      }
    }),
  addedCells: getCached("added"),
  setAddedCells: (addedCells: TCell[]) =>
    set(() => {
      cache({ key: "added", data: addedCells });
      return { addedCells };
    }),
  isWinner: getCached("is_winner"),
  setIsWinner: (isWinner: boolean | null) =>
    set(() => {
      cache({ key: "is_winner", data: isWinner });
      return { isWinner };
    }),
  // setIsWinner: (isWinner: boolean | null) => set({ isWinner }),
  mistakes: getCached("mistakes"),
  resetMistakes: () => set({ mistakes: 0 }),
  incrementMistakes: () =>
    set((state) => {
      const updatedMistakes = state.mistakes + 1;
      cache({ key: "mistakes", data: updatedMistakes });
      return { ...state, mistakes: updatedMistakes };
    }),
}));

export default useSudokuStore;
