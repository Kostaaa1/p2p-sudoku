import React, { FC, memo } from "react";

interface FieldProps {
  colId: number;
  rowId: number;
  colVal: string;
  className: string;
  cellRef: (el: HTMLInputElement) => void;
  handleChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputClick: ({
    colId,
    rowId,
    newValue,
  }: {
    colId: number;
    rowId: number;
    newValue: string;
  }) => void;
}

const Cell: FC<FieldProps> = memo(
  ({ handleInputClick, className, cellRef, colId, rowId, colVal, handleChangeInput }) => {
    return (
      <input
        ref={cellRef}
        type="text"
        value={colVal}
        onChange={(e) => handleChangeInput(e)}
        onClick={() => handleInputClick({ colId, rowId, newValue: colVal })}
        className={className}
      />
    );
  }
);

export default Cell;
