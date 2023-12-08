import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import usePeerStore from "./store/peerStore";
import { DataConnection } from "peerjs";
import useSudokuStore from "./store/sudokuStore";
import useCountdownStore from "./store/countdownStore";
import toast from "react-hot-toast";

const Countdown = () => {
  const { isWinner, setIsWinner, resetGame } = useSudokuStore();
  const { time, isCountdownActive, setIsCountdownActive, updateCountdown } =
    useCountdownStore();
  const { connection } = usePeerStore();

  const resetCount = async () => {
    if (isWinner === null && !connection) resetGame();
    if (connection) {
      toast("You can not reset when playing against another player.");
    }
  };
  const startCount = () => {
    if (isWinner === null) setIsCountdownActive(true);
  };

  useEffect(() => {
    if (!isCountdownActive || isWinner !== null) return;

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
  }, [isCountdownActive, connection ? time && connection : time]);

  return (
    <div className="my-2 flex w-full items-center justify-between text-3xl italic">
      <div className="flex items-center text-lg text-white">
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
          time === "00:00" && "animate-bounce text-red-500",
          isCountdownActive && "text-green-600",
        )}
      >
        {time}
      </p>
    </div>
  );
};

export default Countdown;
