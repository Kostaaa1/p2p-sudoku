import { FC, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import useCountdownStore from "../store/countdownStore";
import toast from "react-hot-toast";
import useSocketStore from "../store/socketStore";
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
import { useSocket } from "../context/SocketProvider";

type CountdownProps = {
  startNewGame: (diff: DifficultySet["data"], sudoku?: string[][]) => void;
};

const Countdown: FC<CountdownProps> = ({ startNewGame }) => {
  const isWinner = useGameStateStore((state) => state.isWinner);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const { setIsWinner } = useGameStateStore((state) => state.actions);

  const roomId = useSocketStore((state) => state.roomId);
  const player1 = useSocketStore((state) => state.player1);

  const time = useCountdownStore((state) => state.time);
  const isCountdownActive = useCountdownStore(
    (state) => state.isCountdownActive,
  );
  const { setIsCountdownActive, decrementCountdown } = useCountdownStore(
    (state) => state.actions,
  );
  const { setTime } = useCountdownStore((state) => state.actions);

  const insertedCells = useInsertedCells();
  const invalidCells = useInvalidCells();
  const mistakes = useMistakesStore((state) => state.mistakes);
  const sudoku = useSudokuStore((state) => state.sudoku);
  // Actions:
  const { setFocusedCell } = useSingleCellActions();
  const { setInvalidCells } = useInvalidCellsActions();
  const { setInsertedCells } = useInsertedCellsActions();
  const { setSudoku } = useSudokuStore((state) => state.actions);
  const { setMistakes } = useMistakesStore((state) => state.actions);
  const [countdown, setCountdown] = useState("");
  const socket = useSocket();

  useEffect(() => {
    // Saving current game cache before the window unload,only if cells are added or mistakes are not
    if (roomId) return;

    const func = () => {
      if (mistakes > 0 || invalidCells.length > 0 || insertedCells.length > 0) {
        console.log("invalidCells", invalidCells);
        const dataCollectior: TUnifiedGame = {
          insertedCells,
          invalidCells,
          isWinner,
          mistakes,
          sudoku,
          time: time as number,
        };

        localStorage.setItem("main_game", JSON.stringify(dataCollectior));
        localStorage.setItem("difficulty", JSON.stringify(difficulty));

        // setAll(JSON.stringify(data));
        setTime(difficulty);
        setInvalidCells(invalidCells);
        setIsWinner(isWinner);
        setSudoku(sudoku);
        setInsertedCells(insertedCells);
        setMistakes(mistakes);
        setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
      }
    };
    window.addEventListener("beforeunload", func);
    return () => {
      window.removeEventListener("beforeunload", func);
    };
  }, [
    insertedCells,
    time,
    difficulty,
    invalidCells,
    sudoku,
    mistakes,
    isWinner,
    roomId,
  ]);

  const resetCount = async () => {
    if (difficulty && isWinner === null && !roomId) {
      startNewGame(difficulty);
    }
    if (roomId) {
      toast("You can not reset when playing against another player.");
    }
  };

  useEffect(() => {
    if (!socket || !time) return;
    let checkInitialUser: boolean | null = null;
    if (roomId && player1) {
      checkInitialUser = roomId.split(player1)[0].length === 0;
    }
    const interval = setInterval(() => {
      if (time > 0) {
        if (checkInitialUser === true) socket.emit("countdown", roomId);
        if (checkInitialUser === null) decrementCountdown();
      } else if (time === 0) {
        localStorage.removeItem("main_game");
        setIsCountdownActive(false);
        clearInterval(interval);
        return;
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!time) return;
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
    setCountdown(formattedTime);
  }, [time]);

  return (
    <div className="text-3xl">
      <div className="flex items-center justify-center text-white">
        <p
          className={twMerge(
            "mr-4 w-20 text-center italic",
            time === 0 && "animate-bounce text-red-500",
            isCountdownActive ? "text-green-600" : "text-blue-600",
          )}
        >
          {countdown}
        </p>
        <button onClick={resetCount} className="bg-red-500 px-3 py-1 text-sm ">
          Reset
        </button>
      </div>
    </div>
  );
};

export default Countdown;
