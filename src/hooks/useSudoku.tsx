import { useEffect, useMemo } from "react";
import usePeerStore from "../store/peerStore";
import toast from "react-hot-toast";
import useSudokuStore from "../store/sudokuStore";
import { TParsedGameCache } from "../types/types";
import useCountdownStore from "../store/countdownStore";
import { generateSudokuBoard } from "../utils/generateSudoku";
import { countdownSet } from "../store/constants";
import { cacheDifficulty, cacheMainGame } from "../utils/utils";

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
    setInitInvalidCellsLength,
  } = useSudokuStore();
  const { setIsToastRan, setIsOpponentReady } = usePeerStore();
  const { setIsCountdownActive, setTime, time } = useCountdownStore();

  const resetGame = (): TParsedGameCache | undefined => {
    if (!difficulty) return;
    localStorage.removeItem("main_game");
    const board = generateSudokuBoard(difficulty);

    setIsToastRan(false);
    setIsCountdownActive(true);
    setIsOpponentReady(false);
    setSudoku(board);
    setIsWinner(null);
    setMistakes(0);
    setAddedCells([]);
    setInvalidCells([]);
    setTime(countdownSet[difficulty]);

    const data: TParsedGameCache = {
      sudoku: board,
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

  const deleteFocusedCell = () => {
    if (!focusedCell) return;
    const { col, row, value } = focusedCell;
    setInvalidCells(invalidCells?.filter((x) => x.value !== value));
    setAddedCells(
      addedCells?.filter(
        (x) => x.row !== row || x.col !== col || x.value !== value
      )
    );
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isWinner !== null || !focusedCell) return;

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

    if (isLastCellEmpty || allCellsFilled) {
      setInvalidCells([...invalidCells]);
    }

    const { col, row } = focusedCell;
    const value = sudoku?.[row][col];

    // Checking row
    const rowInvalidValues = sudoku?.[row]
      .map((cellValue, i) => (cellValue !== "" && cellValue === value ? i : -1))
      .filter((i) => i !== -1);

    if (rowInvalidValues && value && rowInvalidValues.length > 1) {
      rowInvalidValues.forEach((i) => {
        addInvalidCell({ col: i, row, value });
      });
    }

    // Checking column
    const columnInvalidValues = sudoku
      ?.map((row, i) => (row[col] !== "" && row[col] === value ? i : -1))
      .filter((x) => x !== -1);

    if (columnInvalidValues && value && columnInvalidValues.length > 1) {
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

    if (time) setTime(time);
    setInitInvalidCellsLength(invalidCells.length);
    setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
    setAddedCells(addedCells);
    setInvalidCells(invalidCells);
    setSudoku(sudoku);
    setMistakes(mistakes);
    setIsWinner(isWinner);
  };

  useEffect(() => {
    const func = () => {
      if (!sudoku || !difficulty || addedCells.length === 0) return;

      const data: TParsedGameCache = {
        addedCells,
        invalidCells,
        isWinner,
        mistakes,
        sudoku,
        time,
      };

      console.log("beforeunload called", data);
      cacheMainGame(data);
      cacheDifficulty(difficulty);
      setAll(JSON.stringify(data));
    };

    window.addEventListener("beforeunload", func);
    return () => {
      window.removeEventListener("beforeunload", func);
    };
  }, [addedCells, difficulty, invalidCells, time, sudoku, mistakes, isWinner]);

  useEffect(() => {
    const game = localStorage.getItem("main_game");
    if (game) {
      setAll(game);
      return;
    }

    if (!difficulty || isWinner !== null) return;

    console.log("difficulty in useSudoku", difficulty);
    cacheDifficulty(difficulty);
    const gameData = resetGame();
    setAll(JSON.stringify(gameData));
  }, [difficulty]);

  return {
    handleChangeInput,
    resetGame,
    allCellsFilled,
    toastMessageConstructor,
  };
};

export default useSudoku;
