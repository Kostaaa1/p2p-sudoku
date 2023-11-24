import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import useSudoku from "./hooks/useSudoku";
import useStore from "./store/store";
import { DataConnection } from "peerjs";
import { updateCountdown } from "./utils/utils";
import { PeerResponse } from "./types/types";
import useSudokuStore from "./store/sudokuStore";

const Countdown = () => {
  const { resetSudokuBoard } = useSudoku();
  const { isWinner, setIsWinner } = useSudokuStore();
  const {
    connection,
    isCountdownActive,
    setIsCountdownActive,
    STARTING_TIME,
    END_TIME,
    time,
    setTime,
  } = useStore();

  useEffect(() => {
    if (!isCountdownActive) return;
    let startingTime = parseInt(STARTING_TIME.split(":")[0]) * 60;

    const handleCountdown = (connection?: DataConnection | null) => {
      return setInterval(() => {
        if (startingTime > 0) {
          startingTime--;

          if (connection) {
            connection.send({
              type: "countdown",
              data: startingTime,
            } as PeerResponse);
          } else {
            updateCountdown(startingTime, setTime);
          }
        } else if (startingTime === 0) {
          setIsWinner(false);
          return;
        }
      }, 1000);
    };

    const interval = handleCountdown(connection || null);

    return () => {
      clearInterval(interval);
    };
  }, [STARTING_TIME, isCountdownActive, isWinner]);

  const startCount = () => setIsCountdownActive(true);
  const resetCount = () => {
    if (time !== STARTING_TIME) {
      setIsCountdownActive(false);
      setTime(STARTING_TIME);
      resetSudokuBoard();
    }
  };

  return (
    <div className="my-2 flex w-full items-center justify-between text-3xl font-semibold italic">
      <div className="flex items-center text-lg font-bold text-white">
        <button onClick={startCount} className="mr-2 bg-green-600 px-3 py-1">
          Start
        </button>
        <button onClick={resetCount} className="bg-red-500 px-3 py-1 ">
          Reset
        </button>
      </div>
      <p
        className={twMerge(
          "underline",
          time === END_TIME && "animate-bounce text-red-500",
          isCountdownActive && "text-green-600"
        )}
      >
        {time}
      </p>
    </div>
  );
};

export default Countdown;
