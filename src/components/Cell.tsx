import React, { FC, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { ArrowFunctions, TCell } from "../types/types";
import useSudokuStore from "../store/sudokuStore";

interface FieldProps {
  colId: number;
  rowId: number;
  colVal: string;
  handleChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Cell: FC<FieldProps> = memo(({ colId, rowId, colVal, handleChangeInput }) => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const { invalidCells, isWinner, insertedCells, sudoku, focusedCell, setFocusedCell } =
    useSudokuStore();

  const shouldRenderRightBorder = useMemo(() => {
    return (colId: number) => {
      if (colId !== 2 && colId % 2 === 0) return;

      return (
        3 * Math.floor(colId / 3) + 2 === colId && 3 * Math.floor(colId / 3) + 2 !== 8
      );
    };
  }, []);

  const shouldRenderBottomBorder = useMemo(() => {
    return (rowId: number) => {
      if (rowId !== 2 && rowId % 2 === 0) return;

      return (
        3 * Math.floor(rowId / 3) + 2 === rowId && 3 * Math.floor(rowId / 3) + 2 !== 8
      );
    };
  }, []);

  const isIncluded = (stack: TCell[] | null, obj: TCell): boolean => {
    if (!stack) return false;
    const { col, row, value } = obj;
    return stack.some((x) => x.col === col && x.row === row && x.value === value);
  };

  const highlightRow = useCallback(
    (rowId: number) => {
      return rowId === focusedCell?.row;
    },
    [focusedCell]
  );

  const highlightCol = useCallback(
    (colId: number) => {
      return colId === focusedCell?.col;
    },
    [focusedCell]
  );

  const highlight3x3Box = useCallback(
    (rowId: number, colId: number) => {
      if (!focusedCell) return;
      return (
        Math.floor(colId / 3) === Math.floor(focusedCell.col / 3) &&
        Math.floor(rowId / 3) === Math.floor(focusedCell.row / 3)
      );
    },
    [focusedCell]
  );

  const isFieldClicked = useMemo(() => {
    return (rowId: number, colId: number) => {
      return focusedCell?.col === colId && focusedCell.row === rowId;
    };
  }, [focusedCell]);

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

  const addRightBorder = shouldRenderRightBorder(colId);
  const addBottomBorder = shouldRenderBottomBorder(rowId);
  const inputClassNames = [
    "h-full border border-r-0 border-b-0 border-[#BEC6D4] cursor-pointer text-3xl bg-opacity-100 bg-transparent text-center w-full caret-transparent",
    addRightBorder && "border-r-2 border-r-blue-800",
    addBottomBorder && "border-b-2 border-b-blue-800",
  ];

  return (
    <input
      ref={(el) => (inputRefs.current[rowId * 9 + colId] = el!)}
      type="text"
      value={colVal}
      onChange={(e) => handleChangeInput(e)}
      onClick={() => handleInputClick({ colId, rowId, newValue: colVal })}
      className={twMerge(
        inputClassNames.join(" "),
        highlightRow(rowId) && "bg-blue-100",
        highlightCol(colId) && "bg-blue-100",
        highlight3x3Box(rowId, colId) && "bg-blue-100",
        isIncluded(insertedCells, {
          row: rowId,
          col: colId,
          value: colVal,
        }) && "text-green-600",
        isIncluded(invalidCells, {
          row: rowId,
          col: colId,
          value: colVal,
        }) &&
          isIncluded(insertedCells, {
            row: rowId,
            col: colId,
            value: colVal,
          }) &&
          "text-red-700",
        focusedCell.value &&
          parseInt(focusedCell.value) === parseInt(colVal) &&
          "bg-blue-900 bg-opacity-25",
        isIncluded(invalidCells, {
          row: rowId,
          col: colId,
          value: colVal,
        }) && "bg-red-300 bg-opacity-70",
        isFieldClicked(rowId, colId) && "bg-blue-300 bg-opacity-80"
      )}
    />
  );
});

export default Cell;
