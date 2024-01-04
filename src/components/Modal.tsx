import { FC, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { twMerge } from "tailwind-merge";
import { IconLoaderQuarter } from "@tabler/icons-react";
import usePeerStore from "../store/peerStore";
import useGameStateStore from "../store/gameStateStore";
import { DifficultySet } from "../types/types";
import useMistakesStore from "../store/mistakesStore";

interface ModalProps {
  startNewGame: (dif: DifficultySet["data"]) => void;
  resetGameState: (dif: DifficultySet["data"]) => void;
}

const Modal: FC<ModalProps> = ({ resetGameState, startNewGame }) => {
  const connection = usePeerStore((state) => state.connection);
  const isOpponentReady = usePeerStore((state) => state.isOpponentReady);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const isWinner = useGameStateStore((state) => state.isWinner);
  const mistakes = useMistakesStore((state) => state.mistakes);
  const [isClicked, setIsClicked] = useState<boolean>(false);

  const playAgain = () => {
    if (connection) {
      connection.send({ type: "ready", data: true });
    } else {
      if (difficulty) startNewGame(difficulty);
    }
    setIsClicked(true);
  };

  useEffect(() => {
    if (isClicked && isOpponentReady && connection && difficulty)
      resetGameState(difficulty);
  }, [connection, difficulty, isClicked, isOpponentReady]);

  return (
    <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-70 text-black">
      <div className="flex h-max  w-[420px] flex-col items-center justify-between rounded-md bg-white p-2">
        <div className="pb-4">
          {isWinner === false && (
            <div>
              <h4 className="pb-3 text-center text-2xl">Game Over</h4>
              <p className="text-center leading-4">
                {mistakes === 5
                  ? "You have made 5 mistakes and lost this game. Try again!"
                  : "Time is up. Try again!"}
              </p>
            </div>
          )}
          {isWinner === true && (
            <div className="flex h-full flex-col items-center">
              <h4 className="pb-2 text-2xl font-bold">
                🎉🎉🎉 Congratulations! 🎉🎉🎉
              </h4>
              <p className="font-semibold">You have won the game!</p>
            </div>
          )}
        </div>
        <div className="flex w-full flex-col items-center justify-center">
          <button
            onClick={playAgain}
            disabled={isClicked}
            className={twMerge(
              "block h-max w-full items-center justify-center bg-blue-500 text-white transition-colors duration-100",
              !isClicked ? "bg-blue-500 hover:bg-blue-800" : "bg-slate-400",
            )}
          >
            {connection && isClicked ? (
              <div className="flex items-center justify-center">
                <IconLoaderQuarter className="load-animation mr-3 text-gray-200" />
                Waiting for the other player
              </div>
            ) : (
              "Play Again"
            )}
          </button>
        </div>
      </div>
      {isWinner && <Confetti />}
    </div>
  );
};

export default Modal;
