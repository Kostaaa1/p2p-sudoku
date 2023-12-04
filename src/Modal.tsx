import { FC, useEffect } from "react";
import Confetti from "react-confetti";
import useSudokuStore from "./state/sudokuStore";
import usePeerStore from "./state/peerStore";
import { IconLoader2 } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

interface ModalProps {
  mistakes: number;
}

const Modal: FC<ModalProps> = ({ mistakes }) => {
  const { isWinner, resetGame } = useSudokuStore();
  const { connection, isOpponentReady, setIsOpponentReady } = usePeerStore();

  useEffect(() => {
    console.log("rerun");
  }, [isOpponentReady]);

  const playAgain = () => {
    if (connection) {
      setIsOpponentReady(false);
      connection.send({ type: "ready", data: isOpponentReady });
    } else {
      resetGame();
    }
  };

  return (
    <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-70 text-black">
      <div className="z-10 flex h-max  w-[420px] flex-col items-center justify-between rounded-md bg-white p-2">
        <div className="pb-4">
          {isWinner === false && (
            <div>
              <h4 className="pb-3 text-center text-2xl font-bold">Game Over</h4>
              <p className="text-center font-semibold leading-4">
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
            disabled={isOpponentReady}
            className={twMerge(
              "block h-max w-full items-center justify-center text-white transition-colors duration-100",
              !isOpponentReady
                ? "bg-blue-500 hover:bg-blue-800"
                : "bg-slate-400",
            )}
          >
            {isOpponentReady ? (
              <div className="flex items-center justify-center">
                <IconLoader2 className="mr-3 animate-spin text-gray-200" />
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
