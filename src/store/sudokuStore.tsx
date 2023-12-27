import { create } from "zustand";
import { getCached } from "../utils/utils";
import { emptySudoku } from "./constants";
import { produce } from "immer";
import { TCell } from "../types/types";

type SudokuActions = {
  updateSudokuCell: (cell: TCell) => void;
  setSudoku: (sudoku: string[][]) => void;
};

type TUseSudokuStore = {
  sudoku: string[][];
  actions: SudokuActions;
};

const useSudokuStore = create<TUseSudokuStore>((set) => ({
  sudoku: getCached("sudoku") || emptySudoku,
  actions: {
    setSudoku: (board: string[][]) => set({ sudoku: board }),
    updateSudokuCell: (cell: TCell) =>
      set(
        produce((state) => {
          const { col, row, value } = cell;
          state.sudoku[row][col] = value;
        })
      ),
  },
}));

export default useSudokuStore;
