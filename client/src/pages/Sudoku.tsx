import { useCallback, useEffect, useRef } from "react";
import useSudoku from "../hooks/useSudoku";
import Modal from "../components/Modal";
import Countdown from "../components/Countdown";
import DifficultyDropdown from "../components/DifficultyDropdown";
import useGenerateCellStyles from "../hooks/useGenerateCellStyles";
import { twMerge } from "tailwind-merge";
import useKeyboardArrows from "../hooks/useKeyboardArrows";
import useSocketStore from "../store/socketStore";
import useSudokuStore from "../store/sudokuStore";
import useGameStateStore from "../store/gameStateStore";
import useMistakesStore from "../store/mistakesStore";
import useCountdownStore from "../store/countdownStore";
import {
  useInsertedCellsActions,
  useInvalidCellsActions,
  useLastInsertedCell,
  useSingleCellActions,
} from "../store/cellStore";
import { DifficultySet, TUnifiedGame } from "../types/types";
import useToastStore from "../store/toastStore";
import { useShallow } from "zustand/react/shallow";
import { countdownSet, emptySudoku } from "../store/constants";
import { generateSudokuBoard } from "../utils/generateSudoku";
import {
  useAnimationValues,
  useAnimationValuesActions,
} from "../store/animationStore";

function Sudoku() {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const player1 = useSocketStore((state) => state.player1);
  const player2 = useSocketStore((state) => state.player2);
  const roomId = useSocketStore((state) => state.roomId);
  const sudoku = useSudokuStore((state) => state.sudoku);
  const isWinner = useGameStateStore((state) => state.isWinner);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const mistakes = useMistakesStore((state) => state.mistakes);
  const { resetAnimationValues } = useAnimationValuesActions();
  const animationValues = useAnimationValues();
  const isCountdownActive = useCountdownStore(
    (state) => state.isCountdownActive,
  );
  const { setIsOpponentReady } = useSocketStore((state) => state.actions);
  const { resetMistakes, setMistakes } = useMistakesStore(
    (state) => state.actions,
  );
  const { setIsCountdownActive, setTime } = useCountdownStore(
    (state) => state.actions,
  );
  const { setIsToastRan } = useToastStore((state) => state.actions);
  const { setInvalidCells, resetInvalidCells } = useInvalidCellsActions();
  const { setInsertedCells, resetInsertedCells } = useInsertedCellsActions();
  const { setSudoku } = useSudokuStore(useShallow((state) => state.actions));
  const { setFocusedCell } = useSingleCellActions();
  const { setIsWinner } = useGameStateStore((state) => state.actions);

  const lastInsertedCell = useLastInsertedCell();
  const { handleChangeInput } = useSudoku();
  const {
    generateBorderStyle,
    generateCellTextColor,
    generateCellBackgroundColor,
    generateHighlightStyle,
  } = useGenerateCellStyles();
  useKeyboardArrows(inputRefs);

  // // From usePersist storage:
  const setAll = (mainGame: string) => {
    const parsedData: TUnifiedGame = JSON.parse(mainGame);
    const { time, insertedCells, invalidCells, isWinner, mistakes, sudoku } =
      parsedData;

    if (time) {
      setTime(difficulty);
      setInvalidCells(invalidCells);
      setInsertedCells(insertedCells);
      setIsWinner(isWinner);
      setSudoku(sudoku);
      setMistakes(mistakes);
      setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
    }
  };

  // Main Game Setter, whenever difficulty changes new game gets created ( only if there is nothing in storage, the storage gets saved before unloading)j:
  const resetGameState = (difficulty: DifficultySet["data"]) => {
    localStorage.removeItem("main_game");
    setIsToastRan(false);
    setIsCountdownActive(true);
    setIsOpponentReady(false);
    resetMistakes();
    resetInsertedCells();
    resetInvalidCells();
    setTime(difficulty);
    setIsWinner(null);
  };

  const getEmptyUnifiedGame = useCallback(
    (difficulty: DifficultySet["data"]) => {
      const emptyGame: TUnifiedGame = {
        sudoku: emptySudoku,
        insertedCells: [],
        invalidCells: [],
        isWinner: null,
        mistakes: 0,
        time: countdownSet[difficulty],
      };
      return emptyGame;
    },
    [],
  );

  const startNewGame = (diff: DifficultySet["data"], sudoku?: string[][]) => {
    resetGameState(diff);
    const emptyGame = getEmptyUnifiedGame(diff);
    const newGame = sudoku || generateSudokuBoard(diff);
    setAll(JSON.stringify({ ...emptyGame, sudoku: newGame }));
  };

  useEffect(() => {
    if (!roomId) {
      console.log("started kdoskaodkos");
      const cachedGameData = localStorage.getItem("main_game");
      if (cachedGameData) {
        setAll(cachedGameData);
        return;
      }
      if (!difficulty || isWinner !== null) return;
      startNewGame(difficulty);
    }
  }, [difficulty, roomId]);

  ////////////////////////////////////
  //////////// Animation: ////////////
  ////////////////////////////////////
  useEffect(() => {
    if (animationValues.length === 0 || !lastInsertedCell) return;
    const { col, row, value } = lastInsertedCell;
    if (value === "") return;

    const delay = 0.07;
    const addAnimationToCell = (cellId: number, delayMultiplier: number) => {
      const inputRef = inputRefs.current[cellId];
      inputRef.style.animationDelay = "";

      inputRef.classList.remove("animate-wave");
      void inputRef.offsetWidth;
      inputRef.classList.add("animate-wave");

      inputRef.style.animationDelay = `${delayMultiplier}s`;
    };

    if (animationValues.includes("row")) {
      for (let i = 0; i < 9; i++) {
        const rowDelay = Math.abs(col - i) * delay;
        addAnimationToCell(row * 9 + i, rowDelay);
      }
    }

    if (animationValues.includes("col")) {
      for (let i = 0; i < 9; i++) {
        const colDelay = Math.abs(row - i) * delay;
        addAnimationToCell(i * 9 + col, colDelay);
      }
    }

    if (animationValues.includes("grid")) {
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
          const gridDelay =
            (Math.abs(col - j) + Math.abs(row - i)) * (delay + 0.03);
          addAnimationToCell(i * 9 + j, gridDelay);
        }
      }
    }
    resetAnimationValues();
  }, [animationValues, lastInsertedCell]);

  return (
    <div className="flex w-full items-center justify-center font-semibold">
      {/* <div className="h-full px-4 text-center text-3xl text-gray-700">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div> */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex h-12 w-full items-center justify-between">
          <DifficultyDropdown />
          <Countdown startNewGame={startNewGame} />
        </div>
        <div className="relative flex h-[540px] w-[540px] flex-col items-center justify-center overflow-hidden border-2 border-gray-700 bg-white">
          {sudoku?.map((rowVal, rowId) => (
            <div key={rowId} className="flex h-full w-full">
              {rowVal.map((colVal, colId) => (
                <div
                  key={colId}
                  className={twMerge(
                    "relative flex h-full w-full items-center justify-center",
                    generateBorderStyle(rowId, colId),
                    generateHighlightStyle(rowId, colId),
                    generateCellBackgroundColor(rowId, colId, colVal),
                  )}
                >
                  <input
                    ref={(el: HTMLInputElement) =>
                      (inputRefs.current[rowId * 9 + colId] = el!)
                    }
                    type="text"
                    value={colVal}
                    onChange={(e) => handleChangeInput(e)}
                    onClick={() =>
                      setFocusedCell({ row: rowId, col: colId, value: colVal })
                    }
                    className={twMerge(
                      "absolute left-0 top-0 h-full w-full animate-wave cursor-pointer border border-b-0 border-r-0 border-[#BEC6D4] bg-transparent text-center text-3xl text-gray-700 caret-transparent",
                      generateCellTextColor(rowId, colId, colVal),
                    )}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-full items-center justify-between text-sm">
          <span className="text-md flex tracking-tighter text-black">
            My Id:
            <p className="ml-2 text-yellow-600">{player1}</p>
          </span>
          <span className="flex text-lg tracking-tighter text-black">
            Mistakes:
            <p className="ml-2">{`${mistakes}/5`}</p>
          </span>
        </div>
        {roomId && (
          <span className="flex w-full text-sm tracking-tighter text-black">
            Connected to:
            <p className="ml-2 text-yellow-600">{player2}</p>
          </span>
        )}
      </div>
      {/* <div className="h-full px-4 text-center text-3xl font-bold text-gray-700">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div> */}
      {!isCountdownActive && isWinner !== null && (
        <Modal startNewGame={startNewGame} resetGameState={resetGameState} />
      )}
    </div>
  );
}

export default Sudoku;
