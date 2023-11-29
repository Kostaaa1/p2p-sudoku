import { useEffect, useMemo } from "react";
import useStore from "../store/peerStore";
import toast from "react-hot-toast";
import useSudokuStore from "../store/sudokuStore";

const useSudoku = () => {
  const { setIsToastRan } = useStore();
  const {
    setSudoku,
    sudoku,
    setAddedCells,
    addedCells,
    setInvalidCells,
    invalidCells,
    focusedCell,
    isWinner,
    addInvalidCell,
    resetGame,
    setFocusedCell,
  } = useSudokuStore();

  const toastMessageConstructor = ({
    winner,
    message,
  }: {
    winner: boolean;
    message: string;
  }) => {
    const emoji = winner ? "🎉🎉🎉" : "😢😢😢";
    const newMessage = `${emoji}${message}${emoji}`;

    toast(newMessage);
    setIsToastRan(true);
  };

  const deleteFocusedCell = () => {
    const { col, row, value } = focusedCell;
    setInvalidCells(invalidCells?.filter((x) => x.value !== value));
    setAddedCells(
      addedCells?.filter(
        (x) => x.row !== row || x.col !== col || x.value !== value
      )
    );
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isWinner !== null) return;

    const { value } = e.target;

    const { col: colId, row: rowId } = focusedCell;
    const newCell = { row: rowId, col: colId, value };

    if (
      (!Number(value) && value !== "") ||
      (focusedCell.value.length === 1 &&
        !addedCells.some((x) => x.col === colId && x.row === rowId)) ||
      (focusedCell.value.length === 1 && value !== "")
    )
      return;

    focusedCell.value.length > value.length
      ? deleteFocusedCell()
      : setAddedCells([newCell, ...addedCells]);

    // Update Sudoku Cell:
    const newBoard = [...sudoku];
    newBoard[rowId][colId] = newCell.value;
    setSudoku(newBoard);
    setFocusedCell(newCell);
  };

  const isLastCellEmpty = useMemo(() => {
    return sudoku.flat().filter((x) => x === "").length === 1;
  }, [sudoku]);

  const allCellsFilled = useMemo(() => {
    return sudoku.flat().every((x) => x !== "");
  }, [isLastCellEmpty]);

  useEffect(() => {
    if (isWinner !== null) return;

    if (isLastCellEmpty || allCellsFilled) {
      setInvalidCells([...invalidCells]);
    }

    const { col, row } = focusedCell;
    const value = sudoku[row][col];

    // Checking row
    const rowInvalidValues = sudoku[row]
      .map((cellValue, i) => (cellValue !== "" && cellValue === value ? i : -1))
      .filter((i) => i !== -1);

    if (rowInvalidValues.length > 1) {
      rowInvalidValues.forEach((i) => {
        addInvalidCell({ col: i, row, value });
      });
    }

    // Checking column
    const columnInvalidValues = sudoku
      .map((row, i) => (row[col] !== "" && row[col] === value ? i : -1))
      .filter((x) => x !== -1);

    if (columnInvalidValues.length > 1) {
      columnInvalidValues.forEach((i) =>
        addInvalidCell({ col, row: i, value })
      );
    }

    // Checking 3x3 Box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    const gridInvalidValues = [];
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        const gridVal = sudoku[i][j];

        if (gridVal !== "" && gridVal === value) {
          gridInvalidValues.push({ row: i, col: j, value });
        }
      }
    }

    if (gridInvalidValues.length > 1) {
      gridInvalidValues.forEach((cell) => addInvalidCell(cell));
    }
  }, [sudoku]);

  return {
    handleChangeInput,
    resetGame,
    allCellsFilled,
    toastMessageConstructor,
    // inputRefs,
    // focusInput,
  };
};

export default useSudoku;
