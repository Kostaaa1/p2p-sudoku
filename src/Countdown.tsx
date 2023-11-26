import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import useStore from "./store/store";
import { DataConnection } from "peerjs";
import { updateCountdown } from "./utils/utils";
import useSudokuStore from "./store/sudokuStore";

const Countdown = () => {
  const { isWinner, setIsWinner, resetGame } = useSudokuStore();
  const {
    connection,
    isCountdownActive,
    setIsCountdownActive,
    startingTime,
    END_TIME,
    setStartingTime,
    time,
    setTime,
  } = useStore();

  useEffect(() => {
    if (!isCountdownActive) return;
    console.log("startingTime", startingTime);

    let start = parseInt(startingTime.split(":")[0]) * 60;
    const seconds = parseInt(startingTime.split(":")[1]);

    if (seconds > 0) start += seconds;

    const handleCountdown = (connection?: DataConnection | null) => {
      return setInterval(() => {
        if (start > 0) {
          start--;

          if (connection) {
            connection.send({
              type: "countdown",
              data: start,
            });
          } else {
            updateCountdown(start, setTime);
          }
        } else if (start === 0) {
          setIsWinner(false);
          return;
        }
      }, 1000);
    };

    const interval = handleCountdown(connection || null);

    return () => {
      clearInterval(interval);
    };
  }, [isCountdownActive, isWinner]);

  const startCount = () => {
    if (isWinner === null) {
      setIsCountdownActive(true);
    }
  };

  const resetCount = () => {
    if (time !== startingTime && isWinner === null) {
      console.log("reset");
      setIsCountdownActive(false);
      resetGame();
      setTime("15:00");
      setStartingTime("15:00");
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
