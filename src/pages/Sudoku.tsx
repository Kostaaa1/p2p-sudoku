import { useCallback, useEffect, useMemo, useRef } from "react";
import useSudoku from "../hooks/useSudoku";
import Cell from "../components/Cell";
import Modal from "../components/Modal";
import Countdown from "../components/Countdown";
import DifficultyOptions from "../components/DifficultyOptions";
import useGenerateCellStyles from "../hooks/useGenerateCellStyles";
import { twMerge } from "tailwind-merge";
import useKeyboardArrows from "../hooks/useKeyboardArrows";
import usePeerStore from "../store/peerStore";
import useSudokuStore from "../store/sudokuStore";
import useGameStateStore from "../store/gameStateStore";
import useMistakesStore from "../store/mistakesStore";
import useCountdownStore from "../store/countdownStore";
import {
  useInsertedCells,
  useInsertedCellsActions,
  useInvalidCells,
  useInvalidCellsActions,
  useSingleCell,
  useSingleCellActions,
} from "../store/cellStore";
import { DifficultySet, TAnimationData, TStyleCellType, TUnifiedGame } from "../types/types";
import useToastStore from "../store/toastStore";
import { useShallow } from "zustand/react/shallow";
import { countdownSet, emptySudoku } from "../store/constants";
import { generateSudokuBoard } from "../utils/generateSudoku";
import { isCellIncludedInStack } from "../utils/utils";

function Sudoku() {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const connection = usePeerStore((state) => state.connection);
  const peerId = usePeerStore((state) => state.peerId);
  const sudoku = useSudokuStore((state) => state.sudoku);
  const isWinner = useGameStateStore((state) => state.isWinner);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const mistakes = useMistakesStore((state) => state.mistakes);
  const { animationType, lastInsertedCell } = useSingleCell();
  const invalidCells = useInvalidCells();
  const insertedCells = useInsertedCells();

  const {
    generateBorderStyle,
    generateCellStateStyle,
    generateHighlightStyle,
    isFieldClicked,
  } = useGenerateCellStyles();
  const isCountdownActive = useCountdownStore((state) => state.isCountdownActive);
  const { handleChangeInput } = useSudoku();
  // const { handleInputClick } = useKeyboardArrows(inputRefs);
  useKeyboardArrows(inputRefs);

  const { setIsOpponentReady } = usePeerStore((state) => state.actions);
  const { resetMistakes, setMistakes } = useMistakesStore((state) => state.actions);
  const { setIsCountdownActive, setTime } = useCountdownStore((state) => state.actions);
  const { setIsToastRan } = useToastStore((state) => state.actions);
  const { setInvalidCells, resetInvalidCells } = useInvalidCellsActions();
  const { setInsertedCells, resetInsertedCells } = useInsertedCellsActions();
  const { setSudoku } = useSudokuStore(useShallow((state) => state.actions));
  const { setFocusedCell, setLastInsertedCell, setAnimationType } = useSingleCellActions();
  const { setIsWinner } = useGameStateStore((state) => state.actions);
  const { focusedCell } = useSingleCell();

  // // From usePersist storage:
  const setAll = (mainGame: string) => {
    const parsedData: TUnifiedGame = JSON.parse(mainGame);
    const { time, insertedCells, invalidCells, isWinner, mistakes, sudoku } = parsedData;

    if (time) {
      setTime(time);
      setInvalidCells(invalidCells);
      setInsertedCells(insertedCells);
      setIsWinner(isWinner);
      setSudoku(sudoku);
      setMistakes(mistakes);
      setLastInsertedCell(null);
      setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
    }
  };

  // Main Game Setter, whenever difficulty changes new game gets rendered ( only if there is nothing in storage, the storage gets saved before unloading):
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

  const getEmptyUnifiedGame = useCallback((difficulty: DifficultySet["data"]) => {
    const emptyGame: TUnifiedGame = {
      sudoku: emptySudoku,
      insertedCells: [],
      invalidCells: [],
      isWinner: null,
      mistakes: 0,
      time: countdownSet[difficulty],
    };
    return emptyGame;
  }, []);

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

  // // Animation:
  useEffect(() => {
    if (!animationType || !lastInsertedCell) return;
    console.log("ran");
    const { col, row, value } = lastInsertedCell;

    if (value === "") return;
    const delay = 0.06;

    const addAnimationToCell = (animatedCell: number, delayMultiplier: number) => {
      const inputRef = inputRefs.current[animatedCell];

      inputRef.style.animationDelay = "";
      inputRef.classList.remove("animate-wave");
      // Trigger a reflow (force a layout) before adding the class again
      void inputRef.offsetWidth;

      inputRef.classList.add("animate-wave");
      inputRef.style.animationDelay = `${delayMultiplier}s`;
    };

    if (animationType === "row") {
      for (let i = 0; i < 9; i++) {
        const rowDelay = Math.abs(col - i) * delay;
        addAnimationToCell(row * 9 + i, rowDelay);
      }
    }

    if (animationType === "col") {
      for (let i = 0; i < 9; i++) {
        const colDelay = Math.abs(row - i) * delay;
        addAnimationToCell(i * 9 + col, colDelay);
      }
    }

    if (animationType === "grid") {
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;

      for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
          const gridDelay = (Math.abs(col - j) + Math.abs(row - i)) * delay;
          addAnimationToCell(i * 9 + j, gridDelay);
        }
      }
    }
    setAnimationType(null);
  }, [animationType, lastInsertedCell]);

  return (
    <div className="flex items-center justify-center font-semibold">
      <div className="h-full px-4 text-center text-3xl font-bold text-gray-700">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div>
      <div>
        <div className="h-12 flex w-full items-center justify-between">
          <DifficultyOptions />
          <Countdown startNewGame={startNewGame} />
        </div>
        <div className="relative flex h-[540px] w-[540px] flex-col items-center justify-center overflow-hidden border-2 border-gray-700">
          {/* {!allCellsFilled && (
            <div className="absolute top-0 h-full w-full border border-gray-100 bg-gray-800 bg-opacity-10 bg-clip-padding backdrop-blur-sm backdrop-filter">
              <div className="text-3xl italic text-white-900 flex items-center justify-center h-full">
                <IconLoader2 className="h-10 w-10 animate-spin" />
                <span> &nbsp; Loading...</span>
              </div>
            </div>
          )} */}
          {sudoku?.map((rowVal, rowId) => (
            <div key={rowId} className="flex h-full w-full">
              {rowVal.map((colVal, colId) => (
                <div key={colId} className="flex h-full w-full items-center justify-center">
                  <Cell
                    cellRef={(el: HTMLInputElement) =>
                      (inputRefs.current[rowId * 9 + colId] = el!)
                    }
                    colId={colId}
                    colVal={colVal}
                    rowId={rowId}
                    handleChangeInput={handleChangeInput}
                    className={twMerge(
                      generateBorderStyle(rowId, colId),
                      generateHighlightStyle(rowId, colId),
                      generateCellStateStyle(rowId, colId, colVal),
                      isFieldClicked(rowId, colId) && "bg-blue-300 bg-opacity-80"
                    )}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-full items-center justify-between pt-1 text-sm">
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
