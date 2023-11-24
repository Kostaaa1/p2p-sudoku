import React, { FC, useCallback, useMemo, memo, ChangeEvent } from "react";
import { twMerge } from "tailwind-merge";
import { TCell } from "./types/types";

interface FieldProps {
  colId: number;
  rowId: number;
  colVal: string;
  invalidCells: TCell[];
  addedCells: TCell[];
  focusedCell: TCell;
  setFocusedCell: (cell: TCell) => void;
  inputRefs: React.MutableRefObject<HTMLInputElement[]>;
  focusInput: () => void;
  isWinner: boolean | null;
  handleChangeInput: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Cell: FC<FieldProps> = memo(
  ({
    colId,
    rowId,
    colVal,
    invalidCells,
    focusedCell,
    setFocusedCell,
    addedCells,
    inputRefs,
    focusInput,
    isWinner,
    handleChangeInput,
  }) => {
    const shouldRenderRightBorder = useMemo(() => {
      return (colId: number) => {
        if (colId !== 2 && colId % 2 === 0) return;

        return (
          3 * Math.floor(colId / 3) + 2 === colId &&
          3 * Math.floor(colId / 3) + 2 !== 8
        );
      };
    }, []);

    const shouldRenderBottomBorder = useMemo(() => {
      return (rowId: number) => {
        if (rowId !== 2 && rowId % 2 === 0) return;

        return (
          3 * Math.floor(rowId / 3) + 2 === rowId &&
          3 * Math.floor(rowId / 3) + 2 !== 8
        );
      };
    }, []);

    const isIncluded = (stack: TCell[] | null, obj: TCell): boolean => {
      if (!stack) return false;
      const { col, row, value } = obj;
      return stack.some(
        (x) => x.col === col && x.row === row && x.value === value
      );
    };

    const highlightRow = useCallback(
      (rowId: number) => {
        return rowId === focusedCell.row;
      },
      [focusedCell]
    );

    const highlightCol = useCallback(
      (colId: number) => {
        return colId === focusedCell.col;
      },
      [focusedCell]
    );

    const highlight3x3Box = useCallback(
      (rowId: number, colId: number) => {
        return (
          Math.floor(colId / 3) === Math.floor(focusedCell.col / 3) &&
          Math.floor(rowId / 3) === Math.floor(focusedCell.row / 3)
        );
      },
      [focusedCell]
    );

    const isFieldClicked = useMemo(() => {
      return (rowId: number, colId: number) => {
        return focusedCell.col === colId && focusedCell.row === rowId;
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
      if (isWinner !== null) return;

      focusInput();
      const { col, row, value } = focusedCell;
      if (value === newValue && row === rowId && col === colId) return;

      setFocusedCell({
        row: rowId,
        col: colId,
        value: newValue,
      });
    };

    const rightBorder = shouldRenderRightBorder(colId);
    const bottomBorder = shouldRenderBottomBorder(rowId);
    const inputClassNames = [
      "h-full border border-r-0 border-b-0 border-[#BEC6D4] cursor-pointer text-3xl bg-opacity-100 bg-transparent font-semibold text-center w-full caret-transparent",
      rightBorder && "border-r-2 border-r-blue-800",
      bottomBorder && "border-b-2 border-b-blue-800",
    ];

    return (
      <input
        ref={(el) => (inputRefs.current[rowId * 9 + colId] = el!)}
        type="text"
        value={colVal}
        onChange={handleChangeInput}
        onClick={() => handleInputClick({ colId, rowId, newValue: colVal })}
        className={twMerge(
          inputClassNames.join(" "),
          highlightRow(rowId) && "bg-blue-100",
          highlightCol(colId) && "-blue-100",
          highlight3x3Box(rowId, colId) && "bg-blue-100",
          isIncluded(addedCells, {
            row: rowId,
            col: colId,
            value: colVal,
          }) && "text-black",
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
  }
);

export default Cell;
