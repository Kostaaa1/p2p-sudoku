import { useCallback, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { useSingleCell, useInsertedCells, useInvalidCells } from "../store/cellStore";
import { isCellIncludedInStack } from "../utils/utils";

const useGenerateCellStyles = () => {
  const invalidCells = useInvalidCells();
  const insertedCells = useInsertedCells();
  const { focusedCell } = useSingleCell();

  const shouldRenderRightBorder = (colId: number) => {
    if (colId !== 2 && colId % 2 === 0) return;
    return 3 * Math.floor(colId / 3) + 2 === colId && 3 * Math.floor(colId / 3) + 2 !== 8;
  };
  const shouldRenderBottomBorder = (rowId: number) => {
    if (rowId !== 2 && rowId % 2 === 0) return;
    return 3 * Math.floor(rowId / 3) + 2 === rowId && 3 * Math.floor(rowId / 3) + 2 !== 8;
  };

  const isFieldClicked = useMemo(() => {
    return (rowId: number, colId: number) => {
      return focusedCell?.col === colId && focusedCell.row === rowId;
    };
  }, [focusedCell]);

  const generateBorderStyle = (rowId: number, colId: number) => {
    return [
      "h-full border border-r-0 border-b-0 border-[#BEC6D4] cursor-pointer text-3xl bg-opacity-100 bg-transparent text-center w-full caret-transparent",
      shouldRenderRightBorder(colId) && "border-r-2 border-r-blue-800",
      shouldRenderBottomBorder(rowId) && "border-b-2 border-b-blue-800",
    ].join(" ");
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
        isCellIncludedInStack(insertedCells, { row, col, value }) && "text-green-600",
        isCellIncludedInStack(invalidCells, { row, col, value }) &&
          isCellIncludedInStack(insertedCells, { row, col, value }) &&
          "text-red-700",
        focusedCell.value &&
          parseInt(focusedCell.value) === parseInt(value) &&
          "bg-blue-900 bg-opacity-25",
        isCellIncludedInStack(invalidCells, { row, col, value }) &&
          "bg-red-300 bg-opacity-70",
        isFieldClicked(row, col) && "bg-blue-300 bg-opacity-80",
      ].join(" ")
    );
  };

  return { generateBorderStyle, generateHighlightStyle, generateCellStateStyle };
};

export default useGenerateCellStyles;
