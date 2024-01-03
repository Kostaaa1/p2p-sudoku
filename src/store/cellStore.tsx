import { create } from "zustand";
import { TCell, TFocusedCell } from "../types/types";
import { getCached, isCellIncludedInStack, isObjectEqual } from "../utils/utils";
import { useShallow } from "zustand/react/shallow";
import { set } from "lodash";

type InvalidCellsActions = {
  addInvalidCell: (cell: TCell) => void;
  removeInvalidCell: (cell: TCell) => void;
  resetInvalidCells: () => void;
  setInvalidCells: (cell: TCell[]) => void;
};

type InsertedCellsActions = {
  addInsertedCell: (cell: TCell) => void;
  removeInsertedCell: (cell: TCell) => void;
  resetInsertedCells: () => void;
  setInsertedCells: (cell: TCell[]) => void;
};

type TUseSudokuStore = {
  // lastInsertedCell: TCell | null;
  focusedCell: TFocusedCell;
  previousFocusedCell: TFocusedCell | null;
  singleCellActions: {
    setFocusedCell: (cell: TCell) => void;
    // setLastInsertedCell: (cell: TCell | null) => void;
  };
  invalidCells: TCell[];
  invalidCellsActions: InvalidCellsActions;
  insertedCells: TCell[];
  insertedCellsActions: InsertedCellsActions;
};

const useCellStore = create<TUseSudokuStore>((set) => ({
  previousFocusedCell: null,
  // lastInsertedCell: null,
  focusedCell: { col: 0, row: 0 },
  singleCellActions: {
    setFocusedCell: (cell: TCell) =>
      set((state) => ({ previousFocusedCell: state.focusedCell, focusedCell: cell })),
    // setLastInsertedCell: (cell: TCell | null) => set({ lastInsertedCell: cell }),
  },
  invalidCells: getCached("invalidCells") || [],
  invalidCellsActions: {
    addInvalidCell: (cell: TCell) =>
      set((state) => {
        const condition = !isCellIncludedInStack(state.invalidCells, cell);
        return condition ? { invalidCells: [cell, ...state.invalidCells] } : state;
      }),
    removeInvalidCell: (cell: TCell) =>
      set((state) => ({
        invalidCells: state.invalidCells.filter((invCell) => !isObjectEqual(invCell, cell)),
      })),
    resetInvalidCells: () => set({ invalidCells: [] }),
    setInvalidCells: (cells: TCell[]) => set({ invalidCells: cells }),
  },
  insertedCells: getCached("insertedCells") || [],
  insertedCellsActions: {
    setInsertedCells: (cells: TCell[]) => set({ insertedCells: cells }),
    addInsertedCell: (cell: TCell) =>
      set((state) => ({ insertedCells: [cell, ...state.insertedCells] })),
    removeInsertedCell: (newCell: TCell) =>
      set((state) => ({
        insertedCells: state.insertedCells.filter((cell) => !isObjectEqual(cell, newCell)),
      })),
    resetInsertedCells: () => set({ insertedCells: [] }),
  },
}));

// export const useSingleCell = () =>
//   useCellStore(
//     useShallow((state) => ({
//       focusedCell: state.focusedCell,
//       previousFocusedCell: state.previousFocusedCell,
//     }))
//   );
export const useFocusedCell = () => useCellStore((state) => state.focusedCell);
export const usePreviousFocusedCell = () =>
  useCellStore((state) => state.previousFocusedCell);

export const useSingleCellActions = () => useCellStore((state) => state.singleCellActions);

export const useInvalidCells = () => useCellStore((state) => state.invalidCells);
export const useInvalidCellsActions = () =>
  useCellStore((state) => state.invalidCellsActions);

export const useInsertedCells = () => useCellStore((state) => state.insertedCells);
export const useInsertedCellsActions = () =>
  useCellStore((state) => state.insertedCellsActions);
