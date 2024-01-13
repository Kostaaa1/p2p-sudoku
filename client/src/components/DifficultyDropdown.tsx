import { ChangeEvent, useEffect, useRef } from "react";
import { countdownSet } from "../store/constants";
import { DifficultySet } from "../types/types";
import useSocketStore from "../store/socketStore";
import useGameStateStore from "../store/gameStateStore";

const DifficultyDropdown = () => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const roomId = useSocketStore((state) => state.roomId);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const { setDifficulty } = useGameStateStore((state) => state.actions);
  const diffOptions = Object.entries(countdownSet).map((x, id) => ({
    id,
    option: x[0],
    duration: x[1],
  }));

  const handleDifficulty = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DifficultySet["data"];
    setDifficulty(value);
  };

  useEffect(() => {
    const activeValue = selectRef.current?.value;
    if (activeValue) {
      setDifficulty(activeValue as DifficultySet["data"]);
    }
    if (difficulty && selectRef.current) {
      selectRef.current.value = difficulty;
    }
  }, [difficulty]);

  return (
    <div>
      {!roomId ? (
        <div className="flex items-baseline">
          <p className="mr-2 text-lg font-semibold text-black">Difficulty:</p>
          <select
            defaultValue={difficulty}
            className="w-24 cursor-pointer border-b border-b-gray-400 bg-inherit text-base text-gray-500"
            ref={selectRef}
            onChange={handleDifficulty}
          >
            {diffOptions.map((opt) => (
              <option
                key={opt.id}
                value={opt.option}
                className="font-semibold text-gray-700"
              >
                {opt.option[0].toUpperCase() +
                  opt.option.slice(1, opt.option.length)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default DifficultyDropdown;
