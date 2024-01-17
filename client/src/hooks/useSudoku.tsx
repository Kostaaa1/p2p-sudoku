import { ChangeEvent, useCallback } from "react";
import { TCell, TCheckDupliactes } from "../types/types";
import { isCellIncludedInStack } from "../utils/utils";
import useSudokuStore from "../store/sudokuStore";
import useGameStateStore from "../store/gameStateStore";
import {
  useFocusedCell,
  useInsertedCells,
  useInsertedCellsActions,
  useInvalidCells,
  useInvalidCellsActions,
  useSingleCellActions,
} from "../store/cellStore";
import useMistakesStore from "../store/mistakesStore";
import { useAnimationValuesActions } from "../store/animationStore";

const useSudoku = () => {
  const { addAnimationValue } = useAnimationValuesActions();
  const focusedCell = useFocusedCell();
  const { setFocusedCell } = useSingleCellActions();
  const invalidCells = useInvalidCells();
  const { addInvalidCell, removeInvalidCell } = useInvalidCellsActions();
  const insertedCells = useInsertedCells();
  const sudoku = useSudokuStore((state) => state.sudoku);
  const { updateSudokuCell } = useSudokuStore((state) => state.actions);
  const isWinner = useGameStateStore((state) => state.isWinner);
  const { incrementMistakes } = useMistakesStore((state) => state.actions);
  const { addInsertedCell, removeInsertedCell } = useInsertedCellsActions();

  const mutateInvalidCells = (payload: {
    type: "add" | "remove";
    cell: TCell;
  }) => {
    const { cell, type } = payload;
    const { col, row, value } = cell;
    const stack: TCell[] = [];

    const checkInvalidCells = (data: TCheckDupliactes) => {
      const { cells, type } = data;
      const invalidValues: TCell[] = [];
      for (let i = 0; i < cells.length; i++) {
        const newCell =
          type === "grid"
            ? cells[i]
            : {
                row: type === "row" ? row : i,
                col: type === "col" ? col : i,
                value: cells[i],
              };
        if (newCell.value !== "" && newCell.value === value) {
          invalidValues.push(newCell);
        }
      }

      if (invalidValues.length > 0) {
        invalidValues.forEach(
          (cell) => !isCellIncludedInStack(stack, cell) && stack.push(cell),
        );
      }

      const filledValues =
        type !== "grid"
          ? cells.filter((x) => x !== "")
          : cells.filter((x) => x.value !== "");

      if (filledValues.length === 8 && stack.length === 0) {
        addAnimationValue(type);
      }
    };
    checkInvalidCells({ cells: sudoku[row], type: "row" });
    checkInvalidCells({
      cells: sudoku.map((row) => row[col]),
      type: "col",
    });
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    const gridValues: TCell[] = [];
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        gridValues.push({ row: i, col: j, value: sudoku[i][j] });
      }
    }
    checkInvalidCells({ cells: gridValues, type: "grid" });

    //////////////////////////
    if (type === "add" && stack.length > 0) {
      incrementMistakes();
      stack.push(cell);
      stack.forEach((cell) => addInvalidCell(cell));
    }

    if (type === "remove") {
      const removedFocusedStack = stack.filter(
        (x) => !(x.row === row && x.col === col && x.value === value),
      );
      if (removedFocusedStack.length === 1) return false;
    }

    return true;
  };

  const deleteFocusedCell = () => {
    const { row, col, value } = focusedCell;
    if (!value || !sudoku) return;
    const cell: TCell = { row, col, value };
    removeInvalidCell(cell);
    removeInsertedCell(cell);

    const targettedCells = invalidCells.filter(
      (x) =>
        x.value === value &&
        (x.row === row ||
          x.col === col ||
          (Math.floor(x.row / 3) === Math.floor(row / 3) &&
            Math.floor(x.col / 3) === Math.floor(col / 3))),
    );

    targettedCells.forEach((cell) => {
      if (!mutateInvalidCells({ type: "remove", cell }))
        removeInvalidCell(cell);
    });
  };

  const addFocusedCell = (cell: TCell) => {
    addInsertedCell(cell);
    mutateInvalidCells({ type: "add", cell });
  };

  const handleChangeInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (isWinner !== null) return;
      const { value } = e.target;
      const { row: rowId, col: colId, value: focusedValue } = focusedCell;

      if (
        (!Number(value) && value !== "") ||
        (focusedValue?.length === 1 &&
          !insertedCells.some((x) => x.col === colId && x.row === rowId)) ||
        (focusedValue?.length === 1 && value !== "")
      )
        return;

      const newCell = { row: rowId, col: colId, value };
      // Update Sudoku Cell:
      updateSudokuCell(newCell);
      setFocusedCell(newCell);

      focusedValue && focusedValue.length > value.length
        ? deleteFocusedCell()
        : addFocusedCell(newCell);
    },
    [
      isWinner,
      focusedCell,
      insertedCells,
      addInsertedCell,
      updateSudokuCell,
      setFocusedCell,
      deleteFocusedCell,
    ],
  );

  return {
    handleChangeInput,
  };
};

export default useSudoku;
