import { FC, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import usePeerStore from "../store/peerStore";
import { DataConnection } from "peerjs";
import useSudokuStore from "../store/sudokuStore";
import useCountdownStore from "../store/countdownStore";
import toast from "react-hot-toast";
import { DifficultySet, TParsedGameCache } from "../types/types";

type TCountdownProps = {
  startNewGame: (difficulty: DifficultySet["data"]) => TParsedGameCache;
};

const Countdown: FC<TCountdownProps> = ({ startNewGame }) => {
  const { isWinner, setIsWinner, difficulty } = useSudokuStore();
  const { time, isCountdownActive, updateCountdown } = useCountdownStore();
  const { connection } = usePeerStore();

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
          setIsWinner(false);
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
