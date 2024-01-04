import { useCallback, useEffect, useRef } from "react";
import useSudoku from "../hooks/useSudoku";
import Modal from "../components/Modal";
import Countdown from "../components/Countdown";
import DifficultyDropdown from "../components/DifficultyDropdown";
import useGenerateCellStyles from "../hooks/useGenerateCellStyles";
import { twMerge } from "tailwind-merge";
import useKeyboardArrows from "../hooks/useKeyboardArrows";
import usePeerStore from "../store/peerStore";
import useSudokuStore from "../store/sudokuStore";
import useGameStateStore from "../store/gameStateStore";
import useMistakesStore from "../store/mistakesStore";
import useCountdownStore from "../store/countdownStore";
import {
  useInsertedCellsActions,
  useInvalidCellsActions,
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

  const connection = usePeerStore((state) => state.connection);
  const peerId = usePeerStore((state) => state.peerId);
  const sudoku = useSudokuStore((state) => state.sudoku);
  const isWinner = useGameStateStore((state) => state.isWinner);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const mistakes = useMistakesStore((state) => state.mistakes);
  const { resetAnimationValues } = useAnimationValuesActions();
  const animationValues = useAnimationValues();
  const isCountdownActive = useCountdownStore(
    (state) => state.isCountdownActive,
  );
  const { setIsOpponentReady } = usePeerStore((state) => state.actions);
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

  const { handleChangeInput, lastInsertedCell } = useSudoku();
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
      setTime(time);
      setInvalidCells(invalidCells);
      setInsertedCells(insertedCells);
      setIsWinner(isWinner);
      setSudoku(sudoku);
      setMistakes(mistakes);
      setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
    }
  };

  // Main Game Setter, whenever difficulty changes new game gets rendered ( only if there is nothing in storage, the storage gets saved before unloading)j:
  const resetGameState = (difficulty: DifficultySet["data"]) => {
    localStorage.removeItem("main_game");

    setIsToastRan(false);
    setIsCountdownActive(true);
    setIsOpponentReady(false);
    resetMistakes();
    resetInsertedCells();
    resetInvalidCells();
    setTime(countdownSet[difficulty]);
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
    if (!connection) {
      const cachedGameData = localStorage.getItem("main_game");
      if (cachedGameData) {
        setAll(cachedGameData);
        return;
      }

      if (!difficulty || isWinner !== null) return;
      startNewGame(difficulty);
    }
  }, [difficulty]);

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

      for (let k = 0; k < 9; k++) {
        const i = startRow + Math.floor(k / 3);
        const j = startCol + (k % 3);

        const gridDelay = k * delay;
        addAnimationToCell(i * 9 + j, gridDelay);
      }
    }
    resetAnimationValues();
  }, [animationValues, lastInsertedCell]);

  return (
    <div className="flex items-center justify-center font-semibold outline outline-1 outline-black">
      <div className="h-full px-4 text-center text-3xl text-gray-700">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div>
      <div>
        <div className="flex h-12 w-full items-center justify-between">
          <DifficultyDropdown />
          <Countdown startNewGame={startNewGame} />
        </div>
        <div className="relative flex h-[540px] w-[540px] flex-col items-center justify-center overflow-hidden border-2 border-gray-700">
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
                      "animate-wave absolute left-0 top-0 h-full w-full cursor-pointer border border-b-0 border-r-0 border-[#BEC6D4] bg-transparent text-center text-3xl text-gray-700 caret-transparent",
                      generateCellTextColor(rowId, colId, colVal),
                    )}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* <Keyboard /> */}
        <div className="flex w-full items-center justify-between text-sm">
          <span className="text-md flex tracking-tighter text-black">
            PeerID:
            <p className="text-yellow-600" style={{ marginLeft: "8px" }}>
              {peerId}
            </p>
          </span>
          <span className="flex text-lg tracking-tighter text-black">
            Mistakes:
            <p className="" style={{ marginLeft: "8px" }}>
              {`${mistakes}/5`}
            </p>
          </span>
        </div>
        {connection && (
          <span className="flex text-sm tracking-tighter text-black">
            Connected to:
            <p className="text-yellow-600" style={{ marginLeft: "8px" }}>
              {connection.peer}
            </p>
          </span>
        )}
      </div>
      <div className="h-full px-4 text-center text-3xl font-bold text-gray-700">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div>
      {!isCountdownActive && isWinner !== null && (
        <Modal startNewGame={startNewGame} resetGameState={resetGameState} />
      )}
    </div>
  );
}

export default Sudoku;
