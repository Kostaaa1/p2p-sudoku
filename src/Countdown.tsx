import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import useStore from "./store/peerStore";
import { DataConnection } from "peerjs";
import { updateCountdown } from "./utils/utils";
import useSudokuStore from "./store/sudokuStore";
import useCountdownStore from "./store/countdownStore";
import toast from "react-hot-toast";

const Countdown = () => {
  const STARTING_TIME = "15:00";
  const END_TIME = "00:00";

  const { isWinner, setIsWinner, resetGame } = useSudokuStore();
  const { time, setTime, isCountdownActive, setIsCountdownActive } =
    useCountdownStore();

  const [initTime, setInitTime] = useState<string>(time);
  const { connection } = useStore();

  useEffect(() => {
    if (!isCountdownActive) return;

    let start = parseInt(time.split(":")[0]) * 60;
    const seconds = parseInt(time.split(":")[1]);

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

  const start = () => {
    if (isWinner === null) setIsCountdownActive(true);
  };

  const reset = () => {
    if (time !== initTime && isWinner === null && !connection) {
      console.log("reset");
      setInitTime(STARTING_TIME);
      resetGame();
    }

    if (connection) {
      toast("You can not reset when playing against another player.");
    }
  };

  return (
    <div className="my-2 flex w-full items-center justify-between text-3xl font-semibold italic">
      <div className="flex items-center text-lg font-bold text-white">
        <button onClick={start} className="mr-2 bg-green-600 px-3 py-1">
          Start
        </button>
        <button onClick={reset} className="bg-red-500 px-3 py-1 ">
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
