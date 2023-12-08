import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import useSudokuStore from "./store/sudokuStore";
import { twMerge } from "tailwind-merge";
import useCountdownStore from "./store/countdownStore";
import { DataSet, DifficultySet, TimeLimitSet } from "./types/types";
import toast from "react-hot-toast";

const Modes = () => {
  const [page, setPage] = useState<number>(0);
  // const [isPlayAloneClicked, setIsPlayAloneClicked] = useState<boolean>(false);
  const [isLocalStorageEmpty, setIsLocalStorageEmpty] = useState<
    boolean | null
  >(null);
  const { setStartingTime } = useCountdownStore();
  const { setDifficulty } = useSudokuStore();
  const [difficultyData, setDifficultyData] = useState<DifficultySet[]>([
    { id: 0, type: "difficulty", data: "Easy", clicked: true },
    { id: 1, type: "difficulty", data: "Medium", clicked: false },
    { id: 2, type: "difficulty", data: "Hard", clicked: false },
  ]);

  const [countdownLimit, setCountdownLimit] = useState<TimeLimitSet[]>([
    { id: 0, type: "time_limit", data: "12", clicked: true },
    { id: 1, type: "time_limit", data: "15", clicked: false },
    { id: 2, type: "time_limit", data: "20", clicked: false },
  ]);

  const { resetGame } = useSudokuStore();
  const navigate = useNavigate();
  const PAGE_LIMIT = 3;

  const clickPlayAlone = () => {
    setPage((state) => state + 1);
  };

  const nextPage = () => {
    if (page <= PAGE_LIMIT) {
      setPage((state) => state + 1);
    }
  };

  const prevPage = () => {
    if (page >= 0) {
      setPage((state) => state - 1);
    }
  };

  useEffect(() => {
    if (page === 0) {
      setIsLocalStorageEmpty(localStorage.length === 0);
    }
  }, [page]);

  const startNewGame = () => {
    const selectedTime = countdownLimit.find((x) => x.clicked)?.data;
    const selectedDif = difficultyData.find((x) => x.clicked)?.data;

    if (!selectedTime || !selectedDif) {
      toast(
        "You need to select the difficulty and countdown limit before starting the game",
      );
      return;
    }

    localStorage.clear();
    resetGame();
    setStartingTime(selectedTime);
    setDifficulty(selectedDif);
    navigate("/sudoku");
  };

  useEffect(() => {
    if (page === 0) {
      setIsLocalStorageEmpty(localStorage.getItem("countdown") === null);
    }
  }, [page]);

  useEffect(() => {
    console.log("current page", page);
  }, [page]);

  const buttonClick = (type: DataSet["type"], id: number) => {
    if (type === "difficulty") {
      setDifficultyData((state) =>
        state.map((x) =>
          x.id === id ? { ...x, clicked: true } : { ...x, clicked: false },
        ),
      );
    }

    if (type === "time_limit") {
      setCountdownLimit((state) =>
        state.map((x) =>
          x.id === id ? { ...x, clicked: true } : { ...x, clicked: false },
        ),
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center font-semibold">
      <div className="border-1 flex h-max w-96 flex-col items-center justify-center border border-gray-200 p-4 shadow-md shadow-gray-400">
        {page === 0 && (
          <div className="w-full">
            <div className="mb-2 flex h-12 items-center justify-center text-3xl font-bold italic text-blue-600 underline">
              Sudoku
            </div>
            <div className="flex w-full justify-between">
              <button
                onClick={clickPlayAlone}
                className="mr-2 w-full bg-blue-600"
              >
                Singleplayer
              </button>
              <button
                onClick={() => navigate("/sudoku/peer-connect")}
                className="w-full bg-green-600"
              >
                Multiplayer
              </button>
            </div>
          </div>
        )}
        {page === 1 && (
          <div className="w-full">
            <div
              onClick={prevPage}
              className="mb-2 flex h-12 w-max cursor-pointer items-center text-black transition-all duration-150 hover:text-opacity-50 hover:underline"
            >
              <IconArrowLeft />
              Back
            </div>
            <div className="flex w-full justify-between">
              <button onClick={nextPage} className="mr-2 w-full bg-green-600">
                Start New
              </button>
              <button
                onClick={() => navigate("/sudoku")}
                className="w-full bg-blue-600"
              >
                Continue Last
              </button>
            </div>
          </div>
        )}
        {page === 2 && (
          <div className="w-full">
            <div
              onClick={prevPage}
              className="mb-2 flex h-12 w-max cursor-pointer items-center text-black transition-all duration-150 hover:text-opacity-50 hover:underline"
            >
              <IconArrowLeft />
              Back
            </div>
            <div className="mb-2">
              <p className="text-black">Difficulty:</p>
              <div className="flex w-full justify-between">
                {difficultyData.map((x, id) => (
                  <button
                    key={x.id}
                    onClick={() => buttonClick(x.type, x.id)}
                    className={twMerge(
                      "w-full bg-blue-600 transition-all duration-200 hover:bg-green-600",
                      id % 2 !== 0 && "mx-2",
                      x.clicked && "bg-green-600",
                    )}
                  >
                    {x.data}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-black">Time limit:</p>
              <div className="flex w-full justify-between">
                {countdownLimit.map((x, id) => (
                  <button
                    key={x.id}
                    onClick={() => buttonClick(x.type, x.id)}
                    className={twMerge(
                      "w-full bg-blue-600 transition-all duration-200 hover:bg-green-600",
                      id % 2 !== 0 && "mx-2",
                      x.clicked && "bg-green-600",
                    )}
                  >
                    {x.data}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={startNewGame}
              className="bg-g my-2 mt-6 w-full bg-blue-600 py-3 transition-all duration-200 hover:bg-cyan-500"
            >
              🚀 Start 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modes;
