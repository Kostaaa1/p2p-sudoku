import { useCallback, useMemo } from "react";
import { TCell } from "../types/types";
import { twMerge } from "tailwind-merge";
import useSudokuStore from "../store/sudokuStore";

const useGenerateCellStyles = () => {
  const { invalidCells, insertedCells, focusedCell } = useSudokuStore();

  const shouldRenderRightBorder = (colId: number) => {
    if (colId !== 2 && colId % 2 === 0) return;
    return 3 * Math.floor(colId / 3) + 2 === colId && 3 * Math.floor(colId / 3) + 2 !== 8;
  };
  const shouldRenderBottomBorder = (rowId: number) => {
    if (rowId !== 2 && rowId % 2 === 0) return;
    return 3 * Math.floor(rowId / 3) + 2 === rowId && 3 * Math.floor(rowId / 3) + 2 !== 8;
  };

  const isIncluded = (stack: TCell[] | null, obj: TCell): boolean => {
    if (!stack) return false;
    const { col, row, value } = obj;
    return stack.some((x) => x.col === col && x.row === row && x.value === value);
  };

  const isFieldClicked = useMemo(() => {
    return (rowId: number, colId: number) => {
      return focusedCell?.col === colId && focusedCell.row === rowId;
    };
  }, [focusedCell]);

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

  const generateBorderStyle = (rowId: number, colId: number) => {
    return [
      "h-full border border-r-0 border-b-0 border-[#BEC6D4] cursor-pointer text-3xl bg-opacity-100 bg-transparent text-center w-full caret-transparent",
      shouldRenderRightBorder(rowId) && "border-r-2 border-r-blue-800",
      shouldRenderBottomBorder(colId) && "border-b-2 border-b-blue-800",
    ].join(" ");
  };

  const generateHighlightStyle = (rowId: number, colId: number) => {
    return [
      highlightRow(rowId) && "bg-blue-100",
      highlightCol(colId) && "bg-blue-100",
      highlight3x3Box(rowId, colId) && "bg-blue-100",
    ].join(" ");
  };

  const generateCellStateStyle = (row: number, col: number, value: string) => {
    return twMerge(
      [
        isIncluded(insertedCells, { row, col, value }) && "text-green-600",
        isIncluded(invalidCells, { row, col, value }) &&
          isIncluded(insertedCells, { row, col, value }) &&
          "text-red-700",
        focusedCell.value &&
          parseInt(focusedCell.value) === parseInt(value) &&
          "bg-blue-900 bg-opacity-25",
        isIncluded(invalidCells, { row, col, value }) && "bg-red-300 bg-opacity-70",
        isFieldClicked(row, col) && "bg-blue-300 bg-opacity-80",
      ].join(" ")
    );
  };

  return { generateBorderStyle, generateHighlightStyle, generateCellStateStyle };
};

export default useGenerateCellStyles;
