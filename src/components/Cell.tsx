import React, { FC, MutableRefObject, memo } from "react";

interface FieldProps {
  colId: number;
  rowId: number;
  colVal: string;
  className: string;
  handleChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRefs: MutableRefObject<HTMLInputElement[]>;
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
  ({ handleInputClick, inputRefs, className, colId, rowId, colVal, handleChangeInput }) => {
    return (
      <input
        ref={(el: HTMLInputElement) => (inputRefs.current[rowId * 9 + colId] = el!)}
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
