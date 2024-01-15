import { ChangeEvent, useCallback, useEffect } from "react";
import { TCell } from "../types/types";
import { isCellIncludedInStack, isObjectEqual } from "../utils/utils";
import useSudokuStore from "../store/sudokuStore";
import useGameStateStore from "../store/gameStateStore";
import {
  useFocusedCell,
  useInsertedCells,
  useInsertedCellsActions,
  useInvalidCells,
  useInvalidCellsActions,
  useLastInsertedCell,
  useSingleCellActions,
} from "../store/cellStore";
import useMistakesStore from "../store/mistakesStore";
import { useAnimationValuesActions } from "../store/animationStore";

const useSudoku = () => {
  const { addAnimationValue } = useAnimationValuesActions();
  const focusedCell = useFocusedCell();
  const lastInsertedCell = useLastInsertedCell();
  const { setFocusedCell, setLastInsertedCell } = useSingleCellActions();
  const invalidCells = useInvalidCells();
  const { addInvalidCell, removeInvalidCell } = useInvalidCellsActions();
  const insertedCells = useInsertedCells();
  const sudoku = useSudokuStore((state) => state.sudoku);
  const { updateSudokuCell } = useSudokuStore((state) => state.actions);
  const isWinner = useGameStateStore((state) => state.isWinner);
  const { incrementMistakes } = useMistakesStore((state) => state.actions);
  const { addInsertedCell, removeInsertedCell } = useInsertedCellsActions();

  const mutateInvalidCells = useCallback(
    (payload: { type: "add" | "remove"; cell: TCell }) => {
      if (!lastInsertedCell) return;

      console.log("called mutateinvalid");
      const { cell, type } = payload;
      const { col, row, value } = cell;
      const stack: TCell[] = [];

      // Checking column
      const colValues = sudoku[row].filter((x) => x !== "");
      const colInvalidValues = sudoku[row]
        .map((cellValue, i) =>
          cellValue !== "" && cellValue === value ? { row, col: i, value } : -1,
        )
        .filter((i) => i !== -1) as TCell[];

      if (colInvalidValues.length > 1) {
        colInvalidValues.forEach((rowCell) => {
          if (
            rowCell.value === value &&
            !isCellIncludedInStack(stack, rowCell)
          ) {
            stack.push(rowCell);
          }
        });
      }

      // // Checking row
      const rowValues = sudoku
        .map((row) => (row[col] !== "" ? row[col] : -1))
        .filter((x) => x !== -1);

      const rowInvalidValues = sudoku
        .map((row, i) => {
          const newCell = { row: i, col, value };
          return row[col] !== "" && row[col] === value ? newCell : -1;
        })
        .filter((x) => x !== -1) as TCell[];

      if (rowInvalidValues.length > 1) {
        rowInvalidValues.forEach((colCell) => {
          if (
            colCell.value === value &&
            !isCellIncludedInStack(stack, colCell)
          ) {
            stack.push(colCell);
          }
        });
      }

      // // Checking 3x3 Box
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;

      const gridValues = [];
      const gridInvalidValues = [];
      for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
          const gridVal = sudoku?.[i][j];
          const gridCell = { row: i, col: j, value: gridVal };

          if (gridVal !== "") gridValues.push(gridVal);
          if (
            gridVal !== "" &&
            gridVal === value &&
            !isCellIncludedInStack(stack, gridCell)
          ) {
            gridInvalidValues.push(gridCell);
          }
        }
      }

      if (gridInvalidValues.length > 0) {
        gridInvalidValues.forEach((cell) => stack.push(cell));
      }

      if (
        colValues.length === 9 &&
        stack.length === 1 &&
        isObjectEqual(stack[0], lastInsertedCell)
      ) {
        addAnimationValue("row");
      }

      if (
        gridValues.length === 9 &&
        stack.length === 1 &&
        isObjectEqual(stack[0], lastInsertedCell)
      ) {
        addAnimationValue("grid");
      }

      if (
        rowValues.length === 9 &&
        stack.length === 1 &&
        isObjectEqual(stack[0], lastInsertedCell)
      ) {
        addAnimationValue("col");
      }

      if (type === "add" && stack.length > 1) {
        // incrementMistakes();
        stack.forEach((cell) => addInvalidCell(cell));
      }

      if (type === "remove") {
        const removedFocusedStack = stack.filter(
          (x) => !(x.row === row && x.col === col && x.value === value),
        );
        if (removedFocusedStack.length === 1) return false;
      }

      return true;
    },
    [lastInsertedCell],
  );

  useEffect(() => {
    if (isWinner !== null || !lastInsertedCell || lastInsertedCell.value === "")
      return;
    mutateInvalidCells({ type: "add", cell: lastInsertedCell });
  }, [lastInsertedCell]);

  const deleteFocusedCell = () => {
    console.log("deleting cell");
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
      console.log("new Cell", newCell);
      // Update Sudoku Cell:
      setLastInsertedCell(newCell);
      updateSudokuCell(newCell);
      setFocusedCell(newCell);

      focusedValue && focusedValue.length > value.length
        ? deleteFocusedCell()
        : addInsertedCell(newCell);
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
