import { ChangeEvent, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import usePeerStore from "./store/peerStore";
import { DataConnection } from "peerjs";
import useSudokuStore from "./store/sudokuStore";
import useCountdownStore from "./store/countdownStore";
import toast from "react-hot-toast";
import { DifficultySet } from "./types/types";
import useSudoku from "./hooks/useSudoku";
import { countdownSet } from "./store/constants";

const Countdown = () => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const { resetGame } = useSudoku();
  const { setDifficulty, isWinner, setIsWinner, difficulty } = useSudokuStore();
  const { time, isCountdownActive, updateCountdown } = useCountdownStore();
  const { connection } = usePeerStore();
  const diffOptions = Object.entries(countdownSet).map((x, id) => ({
    id,
    option: x[0],
    duration: x[1],
  }));

  const resetCount = async () => {
    if (isWinner === null && !connection) resetGame();
    if (connection) {
      toast("You can not reset when playing against another player.");
    }
  };

  useEffect(() => {
    if (connection) return;

    const activeValue = selectRef.current?.value;
    if (activeValue) {
      setDifficulty(activeValue as DifficultySet["data"]);
    }

    if (difficulty && selectRef.current) {
      selectRef.current.value = difficulty;
    }
  }, [connection, difficulty]);

  useEffect(() => {
    if (!isCountdownActive || isWinner !== null || !time) return;

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

  const handleDifficulty = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DifficultySet["data"];
    setDifficulty(value);
  };

  return (
    <div className="my-2 flex w-full items-center justify-between text-3xl">
      {!connection ? (
        <div className="flex items-baseline">
          <p className="mr-2 text-lg font-semibold text-black">Difficulty:</p>
          <select
            defaultValue={difficulty || "Easy"}
            className="w-24 cursor-pointer border-b border-b-gray-400 bg-inherit text-base text-gray-500"
            ref={selectRef}
            onChange={handleDifficulty}
          >
            {diffOptions.map((opt) => (
              <option key={opt.id} value={opt.option}>
                {opt.option[0].toUpperCase() +
                  opt.option.slice(1, opt.option.length)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div></div>
      )}
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
