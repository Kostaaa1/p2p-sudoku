import { ChangeEvent, useCallback, useEffect } from "react";
import { TCell } from "../types/types";
import { isCellIncludedInStack, isObjectEqual } from "../utils/utils";
import useSudokuStore from "../store/sudokuStore";
import { useShallow } from "zustand/react/shallow";
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
  const { addInsertedCell, removeInsertedCell } = useInsertedCellsActions();

  const sudoku = useSudokuStore((state) => state.sudoku);
  const { updateSudokuCell } = useSudokuStore(
    useShallow((state) => state.actions),
  );
  const isWinner = useGameStateStore((state) => state.isWinner);
  const { incrementMistakes } = useMistakesStore((state) => state.actions);

  /////////////////////////////////////
  const mutateInvalidCells = useCallback(
    (payload: { type: "add" | "remove"; cell: TCell }) => {
      if (!lastInsertedCell) return true;

      const { cell, type } = payload;
      const { col, row, value } = cell;
      const stack: TCell[] = [];

      const checkInvalidValues = (
        values: TCell[],
        type: "row" | "col" | "grid",
      ) => {
        // Maybe i do not need new array for this to work ?????
        const invalidValues = values.filter((x) => x.value === value);
        if (invalidValues.length > 0) {
          invalidValues.forEach((cell) => {
            if (!isCellIncludedInStack(stack, cell)) stack.push(cell);
          });
        }

        const allValuesExist = !values.some((x) => x.value === "");
        if (
          allValuesExist &&
          invalidValues.length === 1 &&
          isObjectEqual(invalidValues[0], lastInsertedCell)
        ) {
          addAnimationValue(type);
        }
      };

      // // Checking 3x3 Box
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      const gridValues = Array.from({ length: 3 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) => ({
          row: startRow + i,
          col: startCol + j,
          value: sudoku[startRow + i][startCol + j],
        })),
      ).flat();

      const rowValues = sudoku[row].map((x, i) => ({ row, col: i, value: x }));
      const colValues = sudoku.map((row, i) => ({
        row: i,
        col,
        value: row[col],
      }));

      checkInvalidValues(rowValues, "row");
      checkInvalidValues(colValues, "col");
      checkInvalidValues(gridValues, "grid");

      if (type === "add" && stack.length > 1) {
        if (value !== "") incrementMistakes();
        stack.forEach((cell) => addInvalidCell(cell));
      }

      if (type === "remove") {
        return !stack.some(
          (x) => x.row === row && x.col === col && x.value === value,
        );
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

  const deleteFocusedCell = useCallback(() => {
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
  }, [
    focusedCell,
    sudoku,
    removeInvalidCell,
    removeInsertedCell,
    invalidCells,
    mutateInvalidCells,
  ]);

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
      focusedValue && focusedValue.length > value.length
        ? deleteFocusedCell()
        : addInsertedCell(newCell);

      // Update Sudoku Cell:
      setLastInsertedCell(newCell);
      updateSudokuCell(newCell);
      setFocusedCell(newCell);
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
