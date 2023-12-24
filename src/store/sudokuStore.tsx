import { create } from "zustand";
import { DifficultySet, TCell, TFocusedCell } from "../types/types";
import { getCached, getCachedDifficulty, isObjectEqual } from "../utils/utils";
import toast from "react-hot-toast";

type TUseSudokuStore = {
  sudoku: string[][] | null;
  setSudoku: (board: string[][]) => void;
  focusedCell: TFocusedCell;
  setFocusedCell: (cell: TCell) => void;
  invalidCells: TCell[];
  setInvalidCells: (cell: TCell[]) => void;
  addInvalidCell: (cell: TCell) => void;
  removeInvalidCell: (cell: TCell) => void;
  insertedCells: TCell[];
  setInsertedCells: (cell: TCell[]) => void;
  addInsertedCell: (cell: TCell) => void;
  removeInsertedCell: (cell: TCell) => void;
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
  lastInsertedCell: TCell | null;
  setLastInsertedCell: (val: TCell | null) => void;
  // Toast:
  toastMessageConstructor: (winnder: boolean, message: string) => void;
  isToastRan: boolean;
  setIsToastRan: (val: boolean) => void;
};

const emptySudoku = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ""));

const useSudokuStore = create<TUseSudokuStore>((set) => ({
  lastInsertedCell: null,
  setLastInsertedCell: (lastInsertedCell: TCell | null) => set({ lastInsertedCell }),
  difficulty: getCachedDifficulty(),
  setDifficulty: (difficulty: DifficultySet["data"] | null) => {
    if (difficulty) localStorage.setItem("difficulty", JSON.stringify(difficulty));
    set({ difficulty });
  },
  initInvalidCellsLength: null,
  setInitInvalidCellsLength: (val: number | null) => set({ initInvalidCellsLength: val }),
  sudoku: getCached("sudoku") || emptySudoku,
  setSudoku: (sudoku: string[][]) => set({ sudoku }),
  focusedCell: { col: 0, row: 0 },
  setFocusedCell: (focusedCell: TCell) => set({ focusedCell }),
  // Invalid cells:
  invalidCells: getCached("invalidCells") || [],
  setInvalidCells: (cells: TCell[]) => set({ invalidCells: cells }),
  addInvalidCell: (data: TCell) =>
    set((state) => {
      const condition = !state.invalidCells.some(
        (x) => x.col === data.col && x.row === data.row && x.value === data.value
      );
      return condition ? { invalidCells: [data, ...state.invalidCells] } : state;
    }),
  removeInvalidCell: (cell: TCell) =>
    set((state) => ({
      invalidCells: state.invalidCells.filter((invCell) => !isObjectEqual(invCell, cell)),
    })),
  insertedCells: getCached("insertedCells") || [],
  setInsertedCells: (insertedCells: TCell[]) => set({ insertedCells }),
  addInsertedCell: (cell: TCell) =>
    set((state) => ({ insertedCells: [cell, ...state.insertedCells] })),
  removeInsertedCell: (newCell: TCell) =>
    set((state) => ({
      insertedCells: state.insertedCells.filter((cell) => !isObjectEqual(cell, newCell)),
    })),
  isWinner: getCached("isWinner") || null,
  setIsWinner: (isWinner: boolean | null) => set({ isWinner }),
  mistakes: getCached("mistakes") || 0,
  setMistakes: (mistakes: number) => set({ mistakes }),
  resetMistakes: () => set({ mistakes: 0 }),
  incrementMistakes: () => set((state) => ({ ...state, mistakes: state.mistakes + 1 })),
  isToastRan: false,
  setIsToastRan: (isToastRan: boolean) =>
    set((state) => ({
      ...state,
      isToastRan,
    })),
  toastMessageConstructor: (winner: boolean, message: string) => {
    const emoji = winner ? "🎉🎉🎉" : "😢😢😢";
    const newMessage = `${emoji}${message}${emoji}`;

    toast(newMessage);
    set({ isToastRan: true });
  },
}));

export default useSudokuStore;
