import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TCell } from "../types/types";
import useStore from "../store/store";
import toast from "react-hot-toast";

const useSudoku = () => {
  const inputRefs = useRef<HTMLInputElement[]>([]);
  // const initSudoku = [
  //   ["", "9", "4", "1", "", "", "5", "", "7"],
  //   ["", "7", "", "", "8", "", "", "", ""],
  //   ["", "", "6", "", "", "4", "1", "2", ""],
  //   ["", "", "1", "", "", "", "", "", "2"],
  //   ["", "", "", "8", "6", "", "9", "7", ""],
  //   ["", "6", "", "2", "", "7", "", "", ""],
  //   ["2", "3", "", "4", "1", "8", "7", "", "6"],
  //   ["6", "4", "", "7", "", "5", "3", "1", "9"],
  //   ["5", "1", "", "", "9", "", "", "", ""],
  // ];
  const initSudoku = [
    ["8", "9", "4", "1", "3", "2", "5", "6", "7"],
    ["1", "7", "2", "5", "8", "6", "4", "9", "3"],
    ["3", "5", "6", "9", "7", "4", "1", "2", "8"],
    ["7", "8", "1", "3", "5", "9", "6", "4", "2"],
    ["4", "2", "3", "8", "6", "1", "9", "7", "5"],
    ["9", "6", "5", "2", "4", "7", "8", "3", "1"],
    ["2", "3", "9", "4", "1", "8", "7", "5", "6"],
    ["6", "4", "8", "7", "2", "5", "3", "1", "9"],
    ["5", "1", "7", "6", "9", "3", "2", "8", ""],
  ];

  const [sudoku, setSudoku] = useState<string[][]>(initSudoku);
  const { isWinner, setIsToastRan } = useStore();

  const [mistakes, setMistakes] = useState<number>(0);

  const [invalidCells, setInvalidCells] = useState<TCell[]>([]);
  const [addedCells, setAddedCells] = useState<TCell[]>([]);
  const [focusedCell, setFocusedCell] = useState<TCell>({
    col: 0,
    row: 0,
    value: sudoku[0][0],
  });

  const resetSudokuBoard = () => {
    if (initSudoku) {
      setSudoku(initSudoku);
      setAddedCells([]);
      setInvalidCells([]);
    }
  };

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

  // Main function for checking sudoku board everytime board gets updated:
  const addInvalidValue = (data: TCell) => {
    setInvalidCells((state) =>
      state &&
      !state.some(
        (x) =>
          x.col === data.col && x.row === data.row && x.value === data.value
      )
        ? [data, ...state]
        : state
    );
  };

  const deleteFocusedCell = () => {
    const { col, row, value } = focusedCell;

    setInvalidCells(
      (state) => state?.filter((x) => x.value !== value) || state
    );
    setAddedCells(
      (state) =>
        state?.filter(
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
      : setAddedCells((state) => (state ? [newCell, ...state] : state));

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

  const isValidSudoku = () => {
    if (isWinner !== null) return;

    if (isLastCellEmpty || allCellsFilled) {
      setInvalidCells([...invalidCells]);
    }

    for (let i = 0; i < 9; i++) {
      const colMap = new Map();
      const rowMap = new Map();
      const gridMap = new Map();

      for (let j = 0; j < 9; j++) {
        const rowVal = sudoku[i][j];
        const colVal = sudoku[j][i];

        const gridRow = 3 * Math.floor(i / 3) + Math.floor(j / 3);
        const gridCol = 3 * (i % 3) + (j % 3);
        const gridVal = sudoku[gridRow][gridCol];

        if (rowVal !== "") {
          const coordinates: TCell = {
            row: i,
            col: j,
            value: rowVal,
          };

          if (rowMap.has(rowVal)) {
            const position = rowMap.get(rowVal);

            addInvalidValue(coordinates);
            addInvalidValue(position);
          } else {
            rowMap.set(rowVal, coordinates);
          }
        }

        if (colVal !== "") {
          const coordinates: TCell = {
            row: j,
            col: i,
            value: colVal,
          };

          if (colMap.has(colVal)) {
            const position = colMap.get(colVal);

            addInvalidValue(coordinates);
            addInvalidValue(position);
          } else {
            colMap.set(colVal, coordinates);
          }
        }

        if (gridVal !== "") {
          const coordinates: TCell = {
            row: gridRow,
            col: gridCol,
            value: gridVal,
          };

          if (gridMap.has(gridVal)) {
            const position = gridMap.get(gridVal);

            addInvalidValue(coordinates);
            addInvalidValue(position);
          } else {
            gridMap.set(gridVal, coordinates);
          }
        }
      }
    }
  };

  useEffect(() => {
    isValidSudoku();
  }, [sudoku]);

  const focusInput = useCallback(() => {
    const { row, col } = focusedCell;
    const inputRef = inputRefs.current[row * 9 + col];

    if (inputRef) {
      inputRef.focus();
      inputRef.setSelectionRange(1, 1);
    }
  }, [focusedCell]);

  // Keyboard Controls
  useEffect(() => {
    if (isWinner === null) {
      const click = (e: KeyboardEvent) => {
        const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

        const { key } = e;
        if (!arrows.includes(key)) return;

        const { col, row } = focusedCell;
        e.preventDefault();

        switch (key) {
          case "ArrowUp":
            if (row > 0) {
              setFocusedCell({
                row: row - 1,
                col,
                value: sudoku[row - 1][col],
              });
            }
            break;
          case "ArrowDown":
            if (row < 8) {
              setFocusedCell({
                row: row + 1,
                col,
                value: sudoku[row + 1][col],
              });
            }
            break;
          case "ArrowLeft":
            if (col > 0) {
              setFocusedCell({
                row,
                col: col - 1,
                value: sudoku[row][col - 1],
              });
            }
            break;
          case "ArrowRight":
            if (col < 8) {
              setFocusedCell({
                row,
                col: col + 1,
                value: sudoku[row][col + 1],
              });
            }
            break;
          default:
            break;
        }
      };
      document.addEventListener("keydown", click);
      focusInput();

      return () => {
        document.removeEventListener("keydown", click);
      };
    }
  }, [focusedCell, focusInput]);

  return {
    handleChangeInput,
    inputRefs,
    resetSudokuBoard,
    sudoku,
    setSudoku,
    addedCells,
    setAddedCells,
    invalidCells,
    setInvalidCells,
    focusedCell,
    setFocusedCell,
    mistakes,
    setMistakes,
    focusInput,
    isLastCellEmpty,
    allCellsFilled,
    toastMessageConstructor,
  };
};

export default useSudoku;
