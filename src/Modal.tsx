import { FC } from "react";
import Confetti from "react-confetti";
import useSudokuStore from "./store/sudokuStore";
import useSudoku from "./hooks/useSudoku";

interface ModalProps {
  mistakes: number;
  closeModal: () => void;
}

const Modal: FC<ModalProps> = ({ closeModal, mistakes }) => {
  const { isWinner } = useSudokuStore();
  const { resetSudokuBoard } = useSudoku();

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
            onClick={resetSudokuBoard}
            className="block h-max w-full items-center justify-center bg-blue-500 text-white transition-colors duration-100 hover:bg-blue-800"
          >
            {isWinner === false ? "Try Again!" : "Play Again!"}
          </button>
          <button
            onClick={closeModal}
            className="block h-max w-full items-center justify-center bg-slate-400 text-white transition-colors duration-100 hover:bg-slate-500"
          >
            Cancel
          </button>
        </div>
      </div>
      {isWinner && <Confetti />}
    </div>
  );
};

export default Modal;
