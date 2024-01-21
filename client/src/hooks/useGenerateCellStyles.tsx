import { useCallback, useMemo } from "react";
import {
  useFocusedCell,
  useInsertedCells,
  useInvalidCells,
} from "../store/cellStore";
import { cn, isCellIncludedInStack, isObjectEqual } from "../utils/utils";

const useGenerateCellStyles = () => {
  const invalidCells = useInvalidCells();
  const insertedCells = useInsertedCells();
  const focusedCell = useFocusedCell();

  const shouldRenderRightBorder = (colId: number) => {
    if (colId !== 2 && colId % 2 === 0) return;
    return (
      3 * Math.floor(colId / 3) + 2 === colId &&
      3 * Math.floor(colId / 3) + 2 !== 8
    );
  };
  const shouldRenderBottomBorder = (rowId: number) => {
    if (rowId !== 2 && rowId % 2 === 0) return;
    return (
      3 * Math.floor(rowId / 3) + 2 === rowId &&
      3 * Math.floor(rowId / 3) + 2 !== 8
    );
  };

  const generateBorderStyle = useMemo(
    () => (rowId: number, colId: number) => {
      return cn(
        shouldRenderBottomBorder(rowId) && "border-b-2 border-b-gray-700",
        shouldRenderRightBorder(colId) && "border-r-2 border-r-gray-700",
      );
    },
    [],
  );

  const highlightRow = (rowId: number) => rowId === focusedCell.row;
  const highlightCol = (colId: number) => colId === focusedCell.col;
  const highlight3x3Box = (rowId: number, colId: number) => {
    return (
      Math.floor(colId / 3) === Math.floor(focusedCell.col / 3) &&
      Math.floor(rowId / 3) === Math.floor(focusedCell.row / 3)
    );
  };

  const generateHighlightStyle = useCallback(
    (rowId: number, colId: number) => {
      return (
        (highlightRow(rowId) ||
          highlightCol(colId) ||
          highlight3x3Box(rowId, colId)) &&
        "bg-blue-100"
      );
    },
    [focusedCell],
  );

  const generateCellTextColor = (row: number, col: number, value: string) => {
    return cn(
      isCellIncludedInStack(insertedCells, { row, col, value }) &&
        "text-blue-600",
      isCellIncludedInStack(invalidCells, { row, col, value }) &&
        isCellIncludedInStack(insertedCells, { row, col, value }) &&
        "text-red-700",
    );
  };

  const generateCellBackgroundColor = (
    row: number,
    col: number,
    value: string,
  ) => {
    return cn(
      focusedCell.value &&
        parseInt(focusedCell.value) === parseInt(value) &&
        !isObjectEqual(focusedCell, { row, col, value }) &&
        "bg-[#6585a9] bg-opacity-40",
      isCellIncludedInStack(invalidCells, { row, col, value }) &&
        "bg-red-400 bg-opacity-70",
      focusedCell.row === row &&
        focusedCell.col === col &&
        "bg-blue-300 bg-opacity-80",
    );
  };

  return {
    generateCellBackgroundColor,
    generateCellTextColor,
    generateBorderStyle,
    generateHighlightStyle,
  };
};

export default useGenerateCellStyles;
