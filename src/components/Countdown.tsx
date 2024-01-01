import { FC, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { DataConnection } from "peerjs";
import useCountdownStore from "../store/countdownStore";
import toast from "react-hot-toast";

import usePeerStore from "../store/peerStore";
import useGameStateStore from "../store/gameStateStore";
import {
  useInsertedCells,
  useInsertedCellsActions,
  useInvalidCells,
  useInvalidCellsActions,
  useSingleCellActions,
} from "../store/cellStore";
import useMistakesStore from "../store/mistakesStore";
import useSudokuStore from "../store/sudokuStore";
import { DifficultySet, TUnifiedGame } from "../types/types";

type CountdownProps = {
  startNewGame: (diff: DifficultySet["data"], sudoku?: string[][]) => void;
};

const Countdown: FC<CountdownProps> = ({ startNewGame }) => {
  const isWinner = useGameStateStore((state) => state.isWinner);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const { setIsWinner } = useGameStateStore((state) => state.actions);

  const connection = usePeerStore((state) => state.connection);

  const time = useCountdownStore((state) => state.time);
  const isCountdownActive = useCountdownStore((state) => state.isCountdownActive);
  const { updateCountdown, setIsCountdownActive } = useCountdownStore(
    (state) => state.actions
  );

  const insertedCells = useInsertedCells();
  const invalidCells = useInvalidCells();
  const mistakes = useMistakesStore((state) => state.mistakes);
  const sudoku = useSudokuStore((state) => state.sudoku);

  // Actions:
  const { setTime } = useCountdownStore((state) => state.actions);
  const { setFocusedCell, setLastInsertedCell } = useSingleCellActions();
  const { setInvalidCells } = useInvalidCellsActions();
  const { setInsertedCells } = useInsertedCellsActions();
  const { setSudoku } = useSudokuStore((state) => state.actions);
  const { setMistakes } = useMistakesStore((state) => state.actions);

  useEffect(() => {
    // Saving current game cache before the window unload, only if cells are added or mistakes are not 0
    if (connection) return;

    const func = () => {
      if (mistakes > 0 || invalidCells.length > 0 || insertedCells.length > 0) {
        console.log("invalidCells", invalidCells);
        const data: TUnifiedGame = {
          insertedCells,
          invalidCells,
          isWinner,
          mistakes,
          sudoku,
          time: time as string,
        };

        localStorage.setItem("main_game", JSON.stringify(data));
        localStorage.setItem("difficulty", JSON.stringify(difficulty));
        // setAll(JSON.stringify(data));

        setTime(time as string);
        setInvalidCells(invalidCells);
        setIsWinner(isWinner);
        setSudoku(sudoku);
        setInsertedCells(insertedCells);
        setMistakes(mistakes);
        setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
        setLastInsertedCell(null);
      }
    };
    window.addEventListener("beforeunload", func);
    return () => {
      window.removeEventListener("beforeunload", func);
    };
  }, [insertedCells, time, difficulty, invalidCells, sudoku, mistakes, isWinner, connection]);

  const resetCount = async () => {
    if (difficulty && isWinner === null && !connection) {
      startNewGame(difficulty);
    }
    if (connection) {
      toast("You can not reset when playing against another player.");
    }
  };

  useEffect(() => {
    if (!isCountdownActive || isWinner !== null || !time || !difficulty) return;

    let start = parseInt(time.split(":")[0]) * 60;
    const seconds = parseInt(time.split(":")[1]);
    if (seconds > 0) start += seconds;

    const handleCountdown = (connection: DataConnection | null) => {
      return setInterval(() => {
        if (start > 0) {
          start--;
          if (connection) {
            connection.send({
              type: "countdown",
              data: start,
            });
          } else {
            updateCountdown(start);
          }
        } else if (start === 0) {
          localStorage.removeItem("main_game");
          setIsCountdownActive(false);
          return;
        }
      }, 1000);
    };

    const interval = handleCountdown(connection);
    return () => {
      clearInterval(interval);
    };
  }, [connection ? time && connection : time, isCountdownActive]);

  return (
    <div className="text-3xl">
      <div className="flex items-center justify-center text-white">
        <p
          className={twMerge(
            "mr-4 w-20 text-center italic",
            time === "00:00" && "animate-bounce text-red-500",
            isCountdownActive ? "text-green-600" : "text-blue-600"
          )}
        >
          {time}
        </p>
        <button onClick={resetCount} className="bg-red-500 px-3 py-1 text-sm ">
          Reset
        </button>
      </div>
    </div>
  );
};

export default Countdown;
