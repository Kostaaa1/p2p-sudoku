import { MutableRefObject, useCallback, useEffect } from "react";
import { ArrowFunctions } from "../types/types";
import { useFocusedCell, useSingleCellActions } from "../store/cellStore";
import useGameStateStore from "../store/gameStateStore";
import useSudokuStore from "../store/sudokuStore";

const useKeyboardArrows = (inputRefs: MutableRefObject<HTMLInputElement[]>) => {
  const focusedCell = useFocusedCell();
  const { setFocusedCell } = useSingleCellActions();

  const isWinner = useGameStateStore((state) => state.isWinner);
  const sudoku = useSudokuStore((state) => state.sudoku);

  const focusInput = useCallback(() => {
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

  return null;
};

export default useKeyboardArrows;
