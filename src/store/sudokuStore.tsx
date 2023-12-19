import { create } from "zustand";
import { DifficultySet, TCell, TFocusedCell } from "../types/types";
import {
  getCached,
  getCachedDifficulty,
  isCellIncludedInStack,
} from "../utils/utils";

type TUseSudokuStore = {
  sudoku: string[][] | null;
  setSudoku: (board: string[][]) => void;
  focusedCell: TFocusedCell;
  setFocusedCell: (cell: TCell) => void;
  invalidCells: TCell[];
  setInvalidCells: (cell: TCell[]) => void;
  addInvalidCell: (cell: TCell) => void;
  // removeInvalidCell: (cell: TCell) => void;
  addedCells: TCell[];
  setAddedCells: (cell: TCell[]) => void;
  isWinner: null | boolean;
  setIsWinner: (isWinner: boolean | null) => void;
  mistakes: number;
  setMistakes: (mistakes: number) => void;
  incrementMistakes: () => void;
  resetMistakes: () => void;
  difficulty: DifficultySet["data"] | null;
  setDifficulty: (val: DifficultySet["data"] | null) => void;
  initInvalidCellsLength: number | null;
  setInitInvalidCellsLength: (val: number | null) => void;
  isToastRan: boolean;
  setIsToastRan: (val: boolean) => void;
};

const emptySudoku = Array.from({ length: 9 }, () =>
  Array.from({ length: 9 }, () => "")
);

const useSudokuStore = create<TUseSudokuStore>((set) => ({
  difficulty: getCachedDifficulty(),
  setDifficulty: (difficulty: DifficultySet["data"] | null) => {
    if (difficulty)
      localStorage.setItem("difficulty", JSON.stringify(difficulty));
    set({ difficulty });
  },
  initInvalidCellsLength: null,
  setInitInvalidCellsLength: (val: number | null) =>
    set({ initInvalidCellsLength: val }),
  sudoku: getCached("sudoku") || emptySudoku,
  setSudoku: (sudoku: string[][]) => set({ sudoku }),
  focusedCell: { col: 0, row: 0 },
  setFocusedCell: (focusedCell: TCell) => set({ focusedCell }),
  invalidCells: getCached("invalidCells") || [],
  setInvalidCells: (cells: TCell[]) => set({ invalidCells: cells }),
  addInvalidCell: (data: TCell) =>
    set((state) => {
      const condition = !state.invalidCells.some(
        (x) =>
          x.col === data.col && x.row === data.row && x.value === data.value
      );
      return condition
        ? { invalidCells: [data, ...state.invalidCells] }
        : state;
    }),
  // removeInvalidCell: (data: TCell) =>
  //   set((state) => {
  //     console.log("removed called", data);
  //     const { invalidCells } = state;
  //     const { col, row, value } = data;
  //     return invalidCells.length > 0
  //       ? {
  //           invalidCells: invalidCells.filter(
  //             (x) => !(x.row === row && x.col === col && x.value === value)
  //           ),
  //         }
  //       : state;
  //   }),
  addedCells: getCached("addedCells") || [],
  setAddedCells: (addedCells: TCell[]) => set({ addedCells }),
  isWinner: getCached("isWinner") || null,
  setIsWinner: (isWinner: boolean | null) => set({ isWinner }),
  mistakes: getCached("mistakes") || 0,
  setMistakes: (mistakes: number) => set({ mistakes }),
  resetMistakes: () => set({ mistakes: 0 }),
  incrementMistakes: () =>
    set((state) => ({ ...state, mistakes: state.mistakes + 1 })),
  isToastRan: false,
  setIsToastRan: (isToastRan: boolean) =>
    set((state) => ({
      ...state,
      isToastRan,
    })),
}));

export default useSudokuStore;
