import { create } from "zustand";
import { DifficultySet, TCell } from "../types/types";

type TUseSudokuStore = {
  sudoku: string[][] | null;
  setSudoku: (board: string[][]) => void;
  focusedCell: TCell | null;
  setFocusedCell: (cell: TCell) => void;
  invalidCells: TCell[];
  setInvalidCells: (cell: TCell[]) => void;
  addInvalidCell: (cell: TCell) => void;
  addedCells: TCell[];
  setAddedCells: (cell: TCell[]) => void;
  isWinner: null | boolean;
  setIsWinner: (isWinner: boolean | null) => void;
  mistakes: number;
  setMistakes: (mistakes: number) => void;
  incrementMistakes: () => void;
  resetMistakes: () => void;
  // resetGame: () => void;
  difficulty: DifficultySet["data"] | null;
  setDifficulty: (val: DifficultySet["data"]) => void;
  initInvalidCellsLength: number | null;
  setInitInvalidCellsLength: (val: number | null) => void;
};

const useSudokuStore = create<TUseSudokuStore>((set) => ({
  difficulty: null,
  setDifficulty: (difficulty: DifficultySet["data"]) => set({ difficulty }),
  initInvalidCellsLength: null,
  setInitInvalidCellsLength: (val: number | null) =>
    set({ initInvalidCellsLength: val }),
  // resetGame: () => {
  //   localStorage.clear();

  //   const { setIsCountdownActive } = useCountdownStore.getState();
  //   const { setIsOpponentReady, setIsToastRan } = usePeerStore.getState();

  //   setIsToastRan(false);
  //   setIsCountdownActive(true);
  //   setIsOpponentReady(false);

  //   set((state) => {
  //     const currentDifficulty = state.difficulty;
  //     if (currentDifficulty) {
  //       return {
  //         ...state,
  //         sudoku: generateSudokuBoard(currentDifficulty),
  //         isWinner: null,
  //         invalidCells: [],
  //         addedCells: [],
  //         mistakes: 0,
  //       };
  //     } else {
  //       return state;
  //     }
  //   });
  // },
  sudoku: null,
  setSudoku: (sudoku: string[][]) => set({ sudoku }),
  focusedCell: null,
  setFocusedCell: (focusedCell: TCell) => set({ focusedCell }),
  invalidCells: [],
  setInvalidCells: (cells: TCell[]) => set({ invalidCells: cells }),
  addInvalidCell: (data: TCell) =>
    set((state) => {
      const condition = !state.invalidCells.some(
        (x) =>
          x.col === data.col && x.row === data.row && x.value === data.value,
      );

      if (condition) {
        const updateddCells = [data, ...state.invalidCells];
        return { invalidCells: updateddCells };
      } else {
        return state;
      }
    }),
  addedCells: [],
  setAddedCells: (addedCells: TCell[]) => set({ addedCells }),
  isWinner: null,
  setIsWinner: (isWinner: boolean | null) => set({ isWinner }),
  mistakes: 0,
  setMistakes: (mistakes: number) => set({ mistakes }),
  resetMistakes: () => set({ mistakes: 0 }),
  incrementMistakes: () =>
    set((state) => ({ ...state, mistakes: state.mistakes + 1 })),
}));

export default useSudokuStore;
