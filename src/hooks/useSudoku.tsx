import { ChangeEvent, useCallback, useEffect } from "react";
import { TCell } from "../types/types";
import { isCellIncludedInStack } from "../utils/utils";
import useSudokuStore from "../store/sudokuStore";
import { useShallow } from "zustand/react/shallow";
import useGameStateStore from "../store/gameStateStore";
import {
  useInsertedCells,
  useSingleCell,
  useInsertedCellsActions,
  useInvalidCells,
  useInvalidCellsActions,
  useSingleCellActions,
} from "../store/cellStore";
import useMistakesStore from "../store/mistakesStore";

const useSudoku = () => {
  const { focusedCell, lastInsertedCell } = useSingleCell();
  const { setFocusedCell, setLastInsertedCell } = useSingleCellActions();

  const invalidCells = useInvalidCells();
  const { addInvalidCell, removeInvalidCell } = useInvalidCellsActions();

  const insertedCells = useInsertedCells();
  const { addInsertedCell, removeInsertedCell } = useInsertedCellsActions();

  const sudoku = useSudokuStore((state) => state.sudoku);
  const { updateSudokuCell } = useSudokuStore(useShallow((state) => state.actions));

  const isWinner = useGameStateStore((state) => state.isWinner);
  const { incrementMistakes } = useMistakesStore((state) => state.actions);

  /////////////////////////////////////
  // const isLastCellEmpty = useMemo(() => {
  //   return sudoku?.flat().filter((x) => x === "").length === 1;
  // }, [sudoku]);
  // const allCellsFilled = useMemo(() => {
  //   return sudoku?.flat().every((x) => x !== "");
  // }, [sudoku]);
  /////////////////////////////////////

  const mutateInvalidCells = useCallback(
    (payload: { type: "add" | "remove"; cell: TCell }) => {
      if (!sudoku || !lastInsertedCell) return;

      const { cell, type } = payload;
      const { col, row, value } = cell;
      const stack: TCell[] = [];

      // Checking row
      const rowInvalidValues = sudoku?.[row]
        .map((cellValue, i) =>
          cellValue !== "" && cellValue === value ? { row, col: i, value } : -1
        )
        .filter((i) => i !== -1) as TCell[];
      if (rowInvalidValues.length > 1) {
        rowInvalidValues.forEach((rowCell) => {
          if (rowCell.value === value && !isCellIncludedInStack(stack, rowCell)) {
            stack.push(rowCell);
          }
        });
      }
      // Checking column
      const columnInvalidValues = sudoku
        ?.map((row, i) =>
          row[col] !== "" && row[col] === value ? { row: i, col, value } : -1
        )
        .filter((x) => x !== -1) as TCell[];

      if (columnInvalidValues.length > 1) {
        columnInvalidValues.forEach((colCell) => {
          if (colCell.value === value && !isCellIncludedInStack(stack, colCell)) {
            stack.push(colCell);
          }
        });
      }
      // Checking 3x3 Box
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;

      for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
          const gridVal = sudoku?.[i][j];
          if (gridVal !== "" && value && gridVal === value) {
            const gridCell = { row: i, col: j, value: gridVal };
            if (gridVal === value && !isCellIncludedInStack(stack, gridCell)) {
              stack.push(gridCell);
            }
          }
        }
      }

      console.log("called");
      if (type === "add" && stack.length > 1) {
        incrementMistakes();
        stack.forEach((cell) => addInvalidCell(cell));
      }

      if (type === "remove") {
        const removedFocusedStack = stack.filter(
          (x) => !(x.row === row && x.col === col && x.value === value)
        );
        if (removedFocusedStack.length === 1) return false;
      }
      return true;
    },
    [insertedCells]
    // [sudoku, lastInsertedCell, addInvalidCell, isCellIncludedInStack]
  );

  useEffect(() => {
    if (!sudoku || isWinner !== null || !lastInsertedCell || lastInsertedCell.value === "")
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
            Math.floor(x.col / 3) === Math.floor(col / 3)))
    );

    targettedCells.forEach((cell) => {
      if (!mutateInvalidCells({ type: "remove", cell })) removeInvalidCell(cell);
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
      updateSudokuCell(newCell);
      setLastInsertedCell(newCell);
      setFocusedCell(newCell);
    },
    [
      isWinner,
      focusedCell,
      insertedCells,
      addInsertedCell,
      updateSudokuCell,
      setLastInsertedCell,
      setFocusedCell,
      deleteFocusedCell,
    ]
  );

  return {
    handleChangeInput,
    // resetGameState,
    // startNewGame,
  };
};

export default useSudoku;
