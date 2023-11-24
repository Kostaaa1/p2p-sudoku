import { create } from "zustand";
import { TCell } from "../types/types";

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
  setIsWinner: (isWinner: boolean) => void;
  mistakes: number;
  incrementMistakes: () => void;
  resetMistakes: () => void;
  INIT_INVALID_CELLS_STRING: string | null;
};

const getGame = () => {
  const cachedGame = localStorage.getItem("game");

  if (cachedGame) {
    return JSON.parse(cachedGame);
  } else {
    const initSudoku = [
      ["", "9", "4", "1", "", "", "5", "", "7"],
      ["", "7", "", "", "8", "", "", "", ""],
      ["", "", "6", "", "", "4", "1", "2", ""],
      ["", "", "1", "", "", "", "", "", "2"],
      ["", "", "", "8", "6", "", "9", "7", ""],
      ["", "6", "", "2", "", "7", "", "", ""],
      ["2", "3", "", "4", "1", "8", "7", "", "6"],
      ["6", "4", "", "7", "", "5", "3", "1", "9"],
      ["5", "1", "", "", "9", "", "", "", ""],
    ];

    return initSudoku;
  }
};

const getStringifiedInvalid = () => {
  const cachedInvalids = localStorage.getItem("invalid");
  return cachedInvalids;
};

const getInvalidCells = () => {
  const cachedInvalids = getStringifiedInvalid();
  if (cachedInvalids) {
    return JSON.parse(cachedInvalids);
  } else {
    return [];
  }
};

const getAddedCells = () => {
  const cachedAdded = localStorage.getItem("added");
  if (cachedAdded) {
    return JSON.parse(cachedAdded);
  } else {
    return [];
  }
};

const getMistakes = () => {
  const cachedMistakes = localStorage.getItem("mistakes");
  if (cachedMistakes) {
    return JSON.parse(cachedMistakes);
  } else {
    return 0;
  }
};

const cacheMistakes = (number: number) => {
  localStorage.setItem("mistakes", JSON.stringify(number));
};

const cacheInvalid = (invalid: TCell[]) =>
  localStorage.setItem("invalid", JSON.stringify(invalid));

const useSudokuStore = create<TUseSudokuStore>((set) => ({
  INIT_INVALID_CELLS_STRING: getStringifiedInvalid(),
  sudoku: getGame(),
  setSudoku: (sudoku: string[][]) => set({ sudoku }),
  focusedCell: { col: 0, row: 0, value: getGame()[0][0] },
  setFocusedCell: (focusedCell: TCell) => set({ focusedCell }),
  invalidCells: getInvalidCells(),
  addInvalidCell: (data: TCell) =>
    set((state) => {
      if (
        !state.invalidCells.some(
          (x) =>
            x.col === data.col && x.row === data.row && x.value === data.value
        )
      ) {
        const updateddCells = [data, ...state.invalidCells];
        cacheInvalid(updateddCells);
        return { invalidCells: updateddCells };
      } else {
        return state;
      }
    }),
  setInvalidCells: (cells: TCell[]) =>
    set((state) => ({
      ...state,
      invalidCells: cells,
    })),
  addedCells: getAddedCells(),
  setAddedCells: (cells: TCell[]) =>
    set((state) => ({
      ...state,
      addedCells: cells,
    })),
  isWinner: null,
  setIsWinner: (isWinner: boolean) => set({ isWinner }),
  mistakes: getMistakes(),
  resetMistakes: () => set({ mistakes: 0 }),
  incrementMistakes: () =>
    set((state) => {
      const updatedMistakes = state.mistakes + 1;
      // cacheMistakes(updatedMistakes);
      return { ...state, mistakes: updatedMistakes };
    }),
}));

export default useSudokuStore;
