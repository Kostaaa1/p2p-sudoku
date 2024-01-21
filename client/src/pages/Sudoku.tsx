import { FC, useEffect, useRef, useState } from "react";
import Modal from "../components/Modal";
import Countdown from "../components/Countdown";
import DifficultyDropdown from "../components/DifficultyDropdown";
import useKeyboardArrows from "../hooks/useKeyboardArrows";
import useSocketStore from "../store/socketStore";
import useSudokuStore from "../store/sudokuStore";
import useGameStateStore from "../store/gameStateStore";
import useMistakesStore from "../store/mistakesStore";
import useCountdownStore from "../store/countdownStore";
import { useFocusedCell } from "../store/cellStore";
import {
  useAnimationValues,
  useAnimationValuesActions,
} from "../store/animationStore";
import { DifficultySet } from "../types/types";
import { cn } from "../utils/utils";
import Cell from "../components/Cell";
import _ from "lodash";

interface SudokuProps {
  setAll: (mainGame: string) => void;
  startNewGame: (diff: DifficultySet["data"], sudoku?: string[][]) => void;
}

const Sudoku: FC<SudokuProps> = ({ setAll, startNewGame }) => {
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

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
  // const lastInsertedCell = useLastInsertedCell();
  const focusedCell = useFocusedCell();
  useKeyboardArrows(inputRefs);

  // Main Game Setter, whenever difficulty changes new game gets created ( only if there is nothing in storage, the storage gets saved before unloading)j:
  useEffect(() => {
    if (!roomId) {
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
    if (animationValues.length === 0) return;
    console.log(focusedCell);
    const { col, row, value } = focusedCell;
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
          const gridDelay = (Math.abs(col - j) + Math.abs(row - i)) * delay;
          addAnimationToCell(i * 9 + j, gridDelay);
        }
      }
    }
    resetAnimationValues();
  }, [animationValues]);

  ///////////////////////////
  const [boardSize, setBoardSize] = useState<number>(540);

  useEffect(() => {
    const test = () => {
      if (window.innerWidth <= 550) {
        console.log(window.innerWidth);
        setBoardSize(window.innerWidth);
      }
    };

    window.addEventListener("resize", test);
    return () => {
      window.removeEventListener("resize", test);
    };
  }, []);

  return (
    <main className="flex w-full items-center justify-center font-semibold">
      <div className="p-2">
        <div className="flex h-12 w-full items-center justify-between">
          <DifficultyDropdown />
          <Countdown startNewGame={startNewGame} />
        </div>
        <div
          ref={boardRef}
          style={{
            width: boardSize,
            height: boardSize,
          }}
          className={cn(
            `relative flex h-full w-full flex-col items-center justify-center overflow-hidden border-2 border-gray-700 bg-white`,
          )}
        >
          {sudoku?.map((rowVal, rowId) => (
            <div key={rowId} className="flex h-full w-full">
              {rowVal.map((colVal, colId) => (
                <Cell
                  key={colId}
                  rowId={rowId}
                  colId={colId}
                  colVal={colVal}
                  cellRef={(el: HTMLInputElement) =>
                    (inputRefs.current[rowId * 9 + colId] = el!)
                  }
                />
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
        <Modal startNewGame={startNewGame} />
      )}
    </main>
  );
};

export default Sudoku;
