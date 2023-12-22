import { useEffect, useMemo } from "react";
import usePeerStore from "../store/peerStore";
import toast from "react-hot-toast";
import useSudokuStore from "../store/sudokuStore";
import { DifficultySet, TCell, TParsedGameCache } from "../types/types";
import useCountdownStore from "../store/countdownStore";
import { countdownSet } from "../store/constants";
import { generateSudokuBoard } from "../utils/generateSudoku";
import { isCellIncludedInStack } from "../utils/utils";

const useSudoku = () => {
  const {
    setSudoku,
    sudoku,
    setInvalidCells,
    invalidCells,
    focusedCell,
    isWinner,
    setFocusedCell,
    setIsWinner,
    addInvalidCell,
    removeInvalidCell,
    setMistakes,
    difficulty,
    mistakes,
    setIsToastRan,
    setInitInvalidCellsLength,
    incrementMistakes,
    removeInsertedCell,
    setLastInsertedCell,
    lastInsertedCell,
    addInsertedCell,
    setInsertedCells,
    insertedCells,
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
    setInsertedCells([]);
    setInvalidCells([]);
    setTime(countdownSet[difficulty]);

    const data: TParsedGameCache = {
      sudoku: null,
      insertedCells: [],
      invalidCells: [],
      isWinner: null,
      mistakes: 0,
      time: countdownSet[difficulty],
    };

    return data;
  };

  const isLastCellEmpty = useMemo(() => {
    return sudoku?.flat().filter((x) => x === "").length === 1;
  }, [sudoku]);

  const allCellsFilled = useMemo(() => {
    return sudoku?.flat().every((x) => x !== "");
  }, [sudoku]);

  useEffect(() => {
    console.log("allCellsFilled", allCellsFilled);
  }, [allCellsFilled]);

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

  const mutateInvalidCells = (payload: { type: "add" | "remove"; cell: TCell }) => {
    if (!sudoku || !lastInsertedCell) return;

    const { cell, type } = payload;
    const { col, row, value } = cell;
    const stack: TCell[] = [];

    // Checking row
    const rowInvalidValues = sudoku?.[row]
      .map((cellValue, i) =>
        cellValue !== "" && cellValue === value ? { row, col: i, value } : -1
      )
      .filter((i) => i !== -1) as TCell[];
    if (rowInvalidValues.length > 1) {
      rowInvalidValues.forEach((rowCell) => {
        if (rowCell.value === value && !isCellIncludedInStack(stack, rowCell)) {
          stack.push(rowCell);
        }
      });
    }
    // Checking column
    const columnInvalidValues = sudoku
      ?.map((row, i) => (row[col] !== "" && row[col] === value ? { row: i, col, value } : -1))
      .filter((x) => x !== -1) as TCell[];

    if (columnInvalidValues.length > 1) {
      columnInvalidValues.forEach((colCell) => {
        if (colCell.value === value && !isCellIncludedInStack(stack, colCell)) {
          stack.push(colCell);
        }
      });
    }
    // Checking 3x3 Box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        const gridVal = sudoku?.[i][j];
        if (gridVal !== "" && value && gridVal === value) {
          const gridCell = { row: i, col: j, value: gridVal };
          if (gridVal === value && !isCellIncludedInStack(stack, gridCell)) {
            stack.push(gridCell);
          }
        }
      }
    }

    if (type === "add" && stack.length > 1) {
      // if (stack.length > 0) incrementMistakes();
      stack.forEach((cell) => addInvalidCell(cell));
    }

    if (type === "remove") {
      const removedFocusedStack = stack.filter(
        (x) => !(x.row === row && x.col === col && x.value === value)
      );
      if (removedFocusedStack.length === 1) return false;
    }

    return true;
  };

  useEffect(() => {
    if (isLastCellEmpty || allCellsFilled) setInvalidCells([...invalidCells]);
    if (!sudoku || isWinner !== null || !lastInsertedCell || lastInsertedCell.value === "")
      return;

    // mutateInvalidCells({ type: "add", cell: lastInsertedCell });
  }, [sudoku]);

  const deleteFocusedCell = () => {
    const { row, col, value } = focusedCell;
    if (!value || !sudoku) return;

    const cell: TCell = { row, col, value };
    removeInvalidCell(cell);
    removeInsertedCell(cell);

    const targettedCells = invalidCells.filter(
      (x) =>
        x.value === value &&
        (x.row === row ||
          x.col === col ||
          (Math.floor(x.row / 3) === Math.floor(row / 3) &&
            Math.floor(x.col / 3) === Math.floor(col / 3)))
    );

    targettedCells.forEach((cell) => {
      console.log("cellremoving ", cell);
      if (!mutateInvalidCells({ type: "remove", cell })) removeInvalidCell(cell);
    });
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isWinner !== null) return;
    const { value } = e.target;
    const { row: rowId, col: colId, value: focusedValue } = focusedCell;

    if (
      (!Number(value) && value !== "") ||
      (focusedValue?.length === 1 &&
        !insertedCells.some((x) => x.col === colId && x.row === rowId)) ||
      (focusedValue?.length === 1 && value !== "")
    )
      return;

    const newCell = { row: rowId, col: colId, value };
    setLastInsertedCell(newCell);

    focusedValue && focusedValue.length > value.length
      ? deleteFocusedCell()
      : addInsertedCell(newCell);

    // Update Sudoku Cell:
    // if (sudoku) {
    //   const newBoard = [...sudoku];
    //   newBoard[rowId][colId] = newCell.value;
    //   setSudoku(newBoard);
    //   setFocusedCell(newCell);
    // }
  };

  // From usePersist storage:
  const setAll = (data: string) => {
    const parsed: TParsedGameCache = JSON.parse(data);
    const { time, insertedCells, invalidCells, isWinner, mistakes, sudoku } = parsed;

    if (time && sudoku) {
      setTime(time);
      setInitInvalidCellsLength(invalidCells.length);
      setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
      setInsertedCells(insertedCells);
      setInvalidCells(invalidCells);
      setSudoku(sudoku);
      setMistakes(mistakes);
      setIsWinner(isWinner);
      setLastInsertedCell(null);
    }
  };

  useEffect(() => {
    if (connection) return;

    const func = () => {
      if (!difficulty || (insertedCells.length === 0 && insertedCells.length === 0)) return;

      const data: TParsedGameCache = {
        insertedCells,
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
  }, [insertedCells, difficulty, invalidCells, time, sudoku, mistakes, isWinner, connection]);

  useEffect(() => {
    if (connection) return;
    const game = localStorage.getItem("main_game");
    if (game) {
      setAll(game);
      return;
    }

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
