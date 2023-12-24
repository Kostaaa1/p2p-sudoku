import { MutableRefObject, useCallback, useEffect } from "react";
import useSudokuStore from "../store/sudokuStore";
import { ArrowFunctions } from "../types/types";

const useKeyboardArrows = (inputRefs: MutableRefObject<HTMLInputElement[]>) => {
  const { focusedCell, setFocusedCell, isWinner, sudoku } = useSudokuStore();

  const handleInputClick = ({
    colId,
    rowId,
    newValue,
  }: {
    colId: number;
    rowId: number;
    newValue: string;
  }) => {
    if (isWinner !== null || !focusedCell) return;

    const { col, row, value } = focusedCell;
    if (value === newValue && row === rowId && col === colId) return;

    focusInput();
    setFocusedCell({
      row: rowId,
      col: colId,
      value: newValue,
    });
  };

  const focusInput = useCallback(() => {
    if (!focusedCell) return;
    const { row, col } = focusedCell;
    const inputRef = inputRefs.current[row * 9 + col];

    if (inputRef) {
      inputRef.focus();
      inputRef.setSelectionRange(1, 1);
    }
  }, [focusedCell]);

  // Keyboard Controls
  useEffect(() => {
    if (isWinner === null && sudoku && focusedCell) {
      const { col, row } = focusedCell;

      const arrowFunctions: ArrowFunctions = {
        ArrowUp: () => {
          if (row > 0) {
            setFocusedCell({
              row: row - 1,
              col: col,
              value: sudoku[row - 1][col],
            });
          }
        },
        ArrowDown: () => {
          if (row < 8) {
            setFocusedCell({
              row: row + 1,
              col: col,
              value: sudoku[row + 1][col],
            });
          }
        },
        ArrowLeft: () => {
          if (col > 0) {
            setFocusedCell({
              row: row,
              col: col - 1,
              value: sudoku[row][col - 1],
            });
          }
        },
        ArrowRight: () => {
          if (col < 8) {
            setFocusedCell({
              row: row,
              col: col + 1,
              value: sudoku[row][col + 1],
            });
          }
        },
      };

      const keyPress = (e: KeyboardEvent) => {
        const { key } = e;

        if (arrowFunctions[key]) {
          e.preventDefault();
          arrowFunctions[key]();
        }
      };

      focusInput();
      document.addEventListener("keydown", keyPress);
      return () => {
        document.removeEventListener("keydown", keyPress);
      };
    }
  }, [focusedCell, focusInput]);

  return { handleInputClick };
};

export default useKeyboardArrows;
