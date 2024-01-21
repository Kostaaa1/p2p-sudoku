import { FC } from "react";
import { cn } from "../utils/utils";
import { useSingleCellActions } from "../store/cellStore";
import useGenerateCellStyles from "../hooks/useGenerateCellStyles";
import useSudoku from "../hooks/useSudoku";

type CellProps = {
  colId: number;
  cellRef: any;
  rowId: number;
  colVal: string;
};

const Cell: FC<CellProps> = ({ cellRef, colId, rowId, colVal }) => {
  const { setFocusedCell } = useSingleCellActions();
  const { handleChangeInput } = useSudoku();
  const {
    generateBorderStyle,
    generateCellBackgroundColor,
    generateCellTextColor,
    generateHighlightStyle,
  } = useGenerateCellStyles();

  return (
    <div
      key={colId}
      className={cn(
        "scale relative flex h-full w-full items-center justify-center",
        generateBorderStyle(rowId, colId),
        generateHighlightStyle(rowId, colId),
        generateCellBackgroundColor(rowId, colId, colVal),
      )}
    >
      <input
        ref={cellRef}
        type="text"
        value={colVal}
        onChange={(e) => handleChangeInput(e)}
        onClick={() =>
          setFocusedCell({ row: rowId, col: colId, value: colVal })
        }
        className={cn(
          "absolute left-0 top-0 h-full w-full animate-wave cursor-pointer border border-b-0 border-r-0 border-[#BEC6D4] bg-transparent text-center text-3xl text-gray-700 caret-transparent",
          generateCellTextColor(rowId, colId, colVal),
        )}
      />
    </div>
  );
};

export default Cell;
