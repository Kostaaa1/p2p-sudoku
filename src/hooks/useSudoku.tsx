import { useEffect, useMemo } from "react";
import usePeerStore from "../store/peerStore";
import toast from "react-hot-toast";
import useSudokuStore from "../store/sudokuStore";
import { DifficultySet, TCell, TParsedGameCache } from "../types/types";
import useCountdownStore from "../store/countdownStore";
import { countdownSet } from "../store/constants";
import { generateSudokuBoard } from "../utils/generateSudoku";
import { getCached, isArrayEqual } from "../utils/utils";
import _ from "lodash";

const useSudoku = () => {
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
    setFocusedCell,
    setIsWinner,
    setMistakes,
    difficulty,
    mistakes,
    setIsToastRan,
    setInitInvalidCellsLength,
  } = useSudokuStore();
  const { connection, setIsOpponentReady } = usePeerStore();
  const { setIsCountdownActive, setTime, time } = useCountdownStore();

  const startNewGame = (
    diff: DifficultySet["data"],
    sudoku?: string[][]
  ): TParsedGameCache => {
    const emptyGame = resetGame(diff);
    const newGame = sudoku || generateSudokuBoard(diff);

    setSudoku(newGame);
    return { ...emptyGame, sudoku: newGame };
  };

  const resetGame = (difficulty: DifficultySet["data"]): TParsedGameCache => {
    localStorage.removeItem("main_game");

    setIsToastRan(false);
    setIsCountdownActive(true);
    setIsOpponentReady(false);
    setIsWinner(null);
    setMistakes(0);
    setAddedCells([]);
    setInvalidCells([]);
    setTime(countdownSet[difficulty]);

    const data: TParsedGameCache = {
      sudoku: null,
      addedCells: [],
      invalidCells: [],
      isWinner: null,
      mistakes: 0,
      time: countdownSet[difficulty],
    };

    return data;
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

  // Invalid cells mutation:
  const removeInvalidCell = (cell: TCell) => {
    const { col, row, value } = cell;
    setInvalidCells(
      invalidCells.filter(
        (x) => !(x.row === row && x.col === col && x.value === value)
      )
    );
  };

  const handleRelatedInvalidCellsDelete = (cell: TCell) => {
    if (!sudoku) return;

    let stack: TCell[] = [];
    const { row, col, value } = cell;

    // Checking row
    const rowInvalidValues = sudoku[row]
      .map((cellValue, index) =>
        cellValue !== "" && cellValue === value
          ? { row, col: index, value }
          : -1
      )
      .filter((i) => i !== -1) as TCell[];

    if (rowInvalidValues.length > 1) {
      rowInvalidValues.forEach((rowCell) => {
        stack.push(rowCell);
      });
    }

    // Checking column
    const columnInvalidValues = sudoku
      .map((row, index) =>
        row[col] !== "" && row[col] === value ? { row: index, col, value } : -1
      )
      .filter((x) => x !== -1) as TCell[];

    if (columnInvalidValues.length > 1) {
      columnInvalidValues.forEach((colCell) => {
        stack.push(colCell);
      });
    }

    // Checking 3x3 Box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        const gridVal = sudoku[i][j];
        const gridCell = { row: i, col: j, value };

        if (gridVal !== "" && value && gridVal === value) {
          stack.push(gridCell);
        }
      }
    }

    if (stack.length === 1) removeInvalidCell(stack[0]);
  };

  useEffect(() => {
    const cachedInvalidCells = getCached("invalidCells");

    if (
      invalidCells.length === 0 ||
      (cachedInvalidCells && isArrayEqual(cachedInvalidCells, invalidCells))
    )
      return;

    const { col, row } = focusedCell as TCell;
    const targettedCells = invalidCells.filter(
      (x) =>
        x.row === row ||
        x.col === col ||
        (Math.floor(x.row / 3) === Math.floor(row / 3) &&
          Math.floor(x.col / 3) === Math.floor(col / 3))
    );

    targettedCells.forEach((cell) => handleRelatedInvalidCellsDelete(cell));
  }, [invalidCells]);

  const deleteFocusedCell = () => {
    if (!focusedCell || !focusedCell.value || !sudoku) return;
    const { row, col, value } = focusedCell;

    removeInvalidCell({ row, col, value });
    setAddedCells(
      addedCells?.filter(
        (x) => !(x.row !== row && x.col !== col && x.value !== value)
      )
    );
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isWinner !== null || !focusedCell) return;

    const { value } = e.target;
    const { row: rowId, col: colId, value: focusedValue } = focusedCell;

    if (
      (!Number(value) && value !== "") ||
      (focusedValue?.length === 1 &&
        !addedCells.some((x) => x.col === colId && x.row === rowId)) ||
      (focusedValue?.length === 1 && value !== "")
    )
      return;

    const newCell = { row: rowId, col: colId, value };
    focusedValue && focusedValue.length > value.length
      ? deleteFocusedCell()
      : setAddedCells([newCell, ...addedCells]);

    // Update Sudoku Cell:
    if (sudoku) {
      const newBoard = [...sudoku];
      newBoard[rowId][colId] = newCell.value;
      setSudoku(newBoard);
      setFocusedCell(newCell);
    }
  };

  const isLastCellEmpty = useMemo(() => {
    return sudoku?.flat().filter((x) => x === "").length === 1;
  }, [sudoku]);

  const allCellsFilled = useMemo(() => {
    return sudoku?.flat().every((x) => x !== "");
  }, [sudoku]);

  useEffect(() => {
    if (isWinner !== null || !focusedCell) return;
    if (isLastCellEmpty || allCellsFilled) setInvalidCells([...invalidCells]);

    const { row, col, value } = focusedCell;
    // Checking row
    const rowInvalidValues = sudoku?.[row]
      .map((cellValue, i) => (cellValue !== "" && cellValue === value ? i : -1))
      .filter((i) => i !== -1);

    if (rowInvalidValues && value && rowInvalidValues.length > 1) {
      rowInvalidValues.forEach((i) => {
        addInvalidCell({ row, col: i, value });
      });
    }

    // Checking column
    const columnInvalidValues = sudoku
      ?.map((row, i) => (row[col] !== "" && row[col] === value ? i : -1))
      .filter((x) => x !== -1);

    if (columnInvalidValues && value && columnInvalidValues.length > 1) {
      columnInvalidValues.forEach((i) =>
        addInvalidCell({ row: i, col, value })
      );
    }

    // Checking 3x3 Box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    const gridInvalidValues = [];
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        const gridVal = sudoku?.[i][j];

        if (gridVal !== "" && value && gridVal === value) {
          gridInvalidValues.push({ row: i, col: j, value });
        }
      }
    }

    if (gridInvalidValues && gridInvalidValues.length > 1) {
      gridInvalidValues.forEach((cell) => addInvalidCell(cell));
    }
  }, [sudoku]);

  // From usePersist storage:
  const setAll = (data: string) => {
    const parsed: TParsedGameCache = JSON.parse(data);
    const { time, addedCells, invalidCells, isWinner, mistakes, sudoku } =
      parsed;

    if (time && sudoku) {
      setTime(time);
      setInitInvalidCellsLength(invalidCells.length);
      setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
      setAddedCells(addedCells);
      setInvalidCells(invalidCells);
      setSudoku(sudoku);
      setMistakes(mistakes);
      setIsWinner(isWinner);
    }
  };

  useEffect(() => {
    if (connection) return;

    const func = () => {
      if (!difficulty || addedCells.length === 0) return;

      const data: TParsedGameCache = {
        addedCells,
        invalidCells,
        isWinner,
        mistakes,
        sudoku,
        time,
      };

      localStorage.setItem("main_game", JSON.stringify(data));
      localStorage.setItem("difficulty", JSON.stringify(difficulty));

      setAll(JSON.stringify(data));
    };

    window.addEventListener("beforeunload", func);
    return () => {
      window.removeEventListener("beforeunload", func);
    };
  }, [
    addedCells,
    difficulty,
    invalidCells,
    time,
    sudoku,
    mistakes,
    isWinner,
    connection,
  ]);

  useEffect(() => {
    if (connection) return;
    const game = localStorage.getItem("main_game");
    if (game) {
      setAll(game);
      return;
    }

    console.log("difficulty in useSudoku", difficulty);
    if (!difficulty || isWinner !== null) return;

    localStorage.setItem("difficulty", JSON.stringify(difficulty));
    const gameData = startNewGame(difficulty);
    setAll(JSON.stringify(gameData));
  }, [difficulty]);

  return {
    handleChangeInput,
    resetGame,
    startNewGame,
    allCellsFilled,
    toastMessageConstructor,
  };
};

export default useSudoku;
