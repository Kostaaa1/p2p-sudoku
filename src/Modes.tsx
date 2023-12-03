import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import useSudokuStore from "./store/sudokuStore";

const Modes = () => {
  const [isPlayAloneClicked, setIsPlayAloneClicked] = useState<boolean>(false);
  const [isLocalStorageEmpty, setIsLocalStorageEmpty] = useState<
    boolean | null
  >(null);
  const { resetGame } = useSudokuStore();
  const navigate = useNavigate();

  const clickPlayAlone = () => {
    setIsPlayAloneClicked(true);
  };

  const startNewGame = () => {
    localStorage.clear();
    resetGame();
    navigate("/sudoku");
  };

  useEffect(() => {
    console.log(localStorage.getItem("countdown"));
    if (isPlayAloneClicked) {
      setIsLocalStorageEmpty(localStorage.getItem("countdown") === null);
    }
  }, [isPlayAloneClicked]);

  useEffect(() => {
    if (isLocalStorageEmpty) {
      navigate("/sudoku");
    }
  }, [isLocalStorageEmpty]);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-14 text-5xl font-bold italic text-blue-600 underline">
        Sudoku
      </h1>
      <div className="border-1 flex h-max flex-col items-center justify-center border border-gray-200 p-4 pt-1 shadow-md shadow-gray-400">
        {!isPlayAloneClicked && (
          <div>
            <div className="flex h-10 w-full cursor-pointer items-center text-black transition-all duration-150 hover:text-opacity-50 hover:underline"></div>
            <div>
              <button
                onClick={clickPlayAlone}
                className="mr-2 w-36 bg-blue-600"
              >
                Singleplayer
              </button>
              <button
                onClick={() => navigate("/sudoku/peer-connect")}
                className="w-36 bg-green-600"
              >
                Multiplayer
              </button>
            </div>
          </div>
        )}
        {isPlayAloneClicked && (
          <div>
            <div
              onClick={() => setIsPlayAloneClicked((state) => !state)}
              className="flex h-10 w-full cursor-pointer items-center font-semibold text-black transition-all duration-150 hover:text-opacity-50 hover:underline"
            >
              <IconArrowLeft />
              Back
            </div>
            <button
              onClick={() => navigate("/sudoku")}
              className="mr-2 w-36 bg-blue-600"
            >
              Continue Last
            </button>
            <button onClick={startNewGame} className="w-36 bg-green-600">
              Start New
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modes;
