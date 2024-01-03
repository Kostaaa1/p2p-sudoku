import { CSSProperties, ChangeEvent, FC, memo } from "react";
import { twMerge } from "tailwind-merge";
import { useSingleCellActions } from "../store/cellStore";
interface FieldProps {
  colId: number;
  rowId: number;
  colVal: string;
  className: string;
  cellRef: any;
  style?: CSSProperties;
  handleChangeInput: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Cell: FC<FieldProps> = memo(
  ({ style, cellRef, className, colId, rowId, colVal, handleChangeInput }) => {
    const { setFocusedCell } = useSingleCellActions();

    return (
      <input
        ref={cellRef}
        type="text"
        value={colVal}
        onChange={(e) => handleChangeInput(e)}
        onClick={() => setFocusedCell({ row: rowId, col: colId, value: colVal })}
        style={style}
        className={twMerge(
          "text-gray-700 h-full w-full border border-r-0 border-b-0 border-[#BEC6D4] cursor-pointer text-3xl bg-opacity-100 bg-transparent text-center caret-transparent",
          className
        )}
      />
    );
  }
);

export default Cell;
