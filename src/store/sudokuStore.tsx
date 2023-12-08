import { create } from "zustand";
import { DifficultySet, TCell } from "../types/types";
import { cache, getCached } from "../utils/utils";
import useCountdownStore from "./countdownStore";
// import { STARTING_TIME } from "./constants";
import { generateSudokuBoard } from "../utils/generateSudoku";
import usePeerStore from "./peerStore";

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
  difficulty: DifficultySet["data"] | null;
  setDifficulty: (val: DifficultySet["data"]) => void;
};

const useSudokuStore = create<TUseSudokuStore>((set) => ({
  difficulty: null,
  setDifficulty: (difficulty: DifficultySet["data"]) => set({ difficulty }),
  INIT_INVALID_CELLS_STRING: localStorage.getItem("invalid"),
  resetGame: () => {
    localStorage.clear();

    const { startingTime, setTime, setIsCountdownActive } =
      useCountdownStore.getState();
    const { setIsOpponentReady, setIsToastRan } = usePeerStore.getState();

    setIsToastRan(false);
    setIsCountdownActive(true);
    setIsOpponentReady(false);

    if (startingTime) {
      setTime(startingTime);
      cache({ key: "countdown", data: startingTime });
    }

    set((state) => {
      const currentDifficulty = state.difficulty;
      if (currentDifficulty) {
        const board = generateSudokuBoard(currentDifficulty);
        cache({key: "game", data: board})

        return {
          ...state,
          sudoku: board,
          isWinner: null,
          invalidCells: [],
          addedCells: [],
          mistakes: 0,
        };
      } else {
        return state;
      }
    });
  },
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
          x.col === data.col && x.row === data.row && x.value === data.value,
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
