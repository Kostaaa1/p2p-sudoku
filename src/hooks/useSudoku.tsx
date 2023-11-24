import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useStore from "../store/store";
import toast from "react-hot-toast";
import useLocalStorage from "./useLocalStorage";
import useSudokuStore from "../store/sudokuStore";

const useSudoku = () => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const { setIsToastRan } = useStore();
  const { cacheMistakes, cacheInvalid, cacheAdded, cacheGame, clearCache } =
    useLocalStorage();

  const {
    setSudoku,
    sudoku,
    setAddedCells,
    addedCells,
    setInvalidCells,
    invalidCells,
    mistakes,
    focusedCell,
    isWinner,
    addInvalidCell,
    resetMistakes,
    setFocusedCell,
  } = useSudokuStore();

  const initSudoku = [
    ["", "9", "4", "1", "", "", "5", "", "7"],
    ["", "7", "", "", "8", "", "", "", ""],
    ["", "", "6", "", "", "4", "1", "2", ""],
    ["", "", "1", "", "", "", "", "", "2"],
    ["", "", "", "8", "6", "", "9", "7", ""],
    ["", "6", "", "2", "", "7", "", "", ""],
    ["2", "3", "", "4", "1", "8", "7", "", "6"],
    ["6", "4", "", "7", "", "5", "3", "1", "9"],
    ["5", "1", "", "", "9", "", "", "", ""],
  ];

  // const [sudoku, setSudoku] = useState<string[][]>(() => {
  //   const cachedGame = getCachedGame();
  //   return cachedGame ?? initSudoku;
  // });

  // const [invalidCells, setInvalidCells] = useState<TCell[]>(() => {
  //   const cachedInvalid = getCachedInvalid();
  //   return cachedInvalid ?? [];
  // });

  // const [addedCells, setAddedCells] = useState<TCell[]>(() => {
  //   const cachedAdded = getCachedAdded();
  //   return cachedAdded ?? [];
  // });

  // const { isWinner, setIsToastRan } = useStore();
  // const [mistakes, setMistakes] = useState<number>(0);

  // const [focusedCell, setFocusedCell] = useState<TCell>({
  //   col: 0,
  //   row: 0,
  //   value: sudoku[0][0],
  // });

  const resetSudokuBoard = () => {
    setSudoku(initSudoku);
    setAddedCells([]);
    setInvalidCells([]);
    resetMistakes();
    clearCache();
    console.log("ran");
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
  // const addInvalidValue = (data: TCell) => {
  //   setInvalidCells((state) => {
  //     if (
  //       state &&
  //       !state.some(
  //         (x) =>
  //           x.col === data.col && x.row === data.row && x.value === data.value
  //       )
  //     ) {
  //       return [data, ...state];
  //     } else {
  //       return state;
  //     }
  //   });
  // };

  const deleteFocusedCell = () => {
    const { col, row, value } = focusedCell;

    setInvalidCells(invalidCells?.filter((x) => x.value !== value));
    setAddedCells(
      addedCells?.filter(
        (x) => x.row !== row || x.col !== col || x.value !== value
      )
    );

    // setInvalidCells(
    //   (state) => state?.filter((x) => x.value !== value) || state
    // );
    // setAddedCells(
    //   (state) =>
    //     state?.filter(
    //       (x) => x.row !== row || x.col !== col || x.value !== value
    //     )
    // );
  };

  // useEffect(() => {
  //   console.log("updated mistakes");
  //   cacheMistakes(mistakes);
  // }, [mistakes]);

  // useEffect(() => {
  //   console.log("updated addedCells");
  //   cacheAdded(addedCells);
  // }, [addedCells]);

  // useEffect(() => {
  //   console.log("updated invalidCells");
  //   cacheInvalid(invalidCells);
  // }, [invalidCells]);

  // useEffect(() => {
  //   console.log("updated sudoku");
  //   cacheGame(sudoku);
  // }, [sudoku]);

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
    // : setAddedCells((state) => (state ? [newCell, ...state] : state));

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
    focusInput,
    isLastCellEmpty,
    allCellsFilled,
    toastMessageConstructor,
  };
};

export default useSudoku;
