import { useEffect, useRef } from "react";
import useSudoku from "../hooks/useSudoku";
import Cell from "../components/Cell";
import Modal from "../components/Modal";
import booPath from "../assets/boo.mp3";
import hornPath from "../assets/horn.mp3";
import usePeerStore from "../store/peerStore";
import useSudokuStore from "../store/sudokuStore";
import useCountdownStore from "../store/countdownStore";
import Countdown from "../components/Countdown";
import DifficultyOptions from "../components/DifficultyOptions";

function Sudoku() {
  const booRef = useRef<HTMLAudioElement>(null);
  const hornRef = useRef<HTMLAudioElement>(null);

  const { connection, peerId } = usePeerStore();
  const { isCountdownActive, setIsCountdownActive } = useCountdownStore();
  const { invalidCells, isToastRan, mistakes, sudoku, setIsWinner, isWinner } =
    useSudokuStore();
  const { allCellsFilled, startNewGame, toastMessageConstructor, handleChangeInput } =
    useSudoku();

  useEffect(() => {
    if (!isCountdownActive && sudoku) {
      setIsCountdownActive(true);
    }
  }, [sudoku]);

  useEffect(() => {
    if (allCellsFilled && mistakes < 5 && invalidCells.length === 0) {
      setIsWinner(true);
    }
  }, [allCellsFilled, mistakes, invalidCells]);

  useEffect(() => {
    if (mistakes === 5) {
      setIsWinner(false);
      return;
    }
  }, [mistakes]);

  useEffect(() => {
    if (isWinner === null || isToastRan) return;
    setIsCountdownActive(false);
    localStorage.clear();

    if (booRef.current && mistakes < 5 && isWinner === false) {
      booRef.current.volume = 0.1;
      booRef.current.play();

      toastMessageConstructor({
        winner: isWinner,
        message: "Times up, you lost! Try Again.",
      });

      if (connection) {
        connection?.send({
          type: "end_game",
          data: {
            isWinner: false,
            message: "Time's up, you both lost, or tied idk...",
          },
        });
      }
    }

    if (booRef.current && mistakes === 5 && isWinner === false) {
      booRef.current.volume = 0.1;
      booRef.current.play();

      toastMessageConstructor({
        winner: isWinner,
        message: "You have made 5 mistakes, you are done! Try Again",
      });

      if (connection) {
        connection?.send({
          type: "end_game",
          data: {
            isWinner: !isWinner,
            message: "Youu won! The opponent made 5 mistakes!",
          },
        });
      }
    }

    if (hornRef.current && isWinner) {
      hornRef.current.volume = 0.1;
      hornRef.current.play();

      toastMessageConstructor({
        winner: isWinner,
        message: "You Won!!!",
      });

      if (connection) {
        connection?.send({
          type: "end_game",
          data: {
            isWinner: !isWinner,
            message: "You lost. The opponent solved before you!",
          },
        });
      }
    }
  }, [isToastRan, isWinner, mistakes]);

  return (
    <div className="flex items-center justify-center font-semibold text-blue-600">
      <div className="h-full px-4 text-center text-3xl font-bold text-blue-600">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div>
      <div>
        <div className="h-12 flex w-full items-center justify-between">
          <DifficultyOptions />
          <Countdown startNewGame={startNewGame} />
        </div>
        <div className="relative flex h-[540px] w-[540px] flex-col items-center justify-center overflow-hidden border-2 border-blue-800">
          {/* {!allCellsFilled && (
            <div className="absolute top-0 h-full w-full border border-gray-100 bg-gray-800 bg-opacity-10 bg-clip-padding backdrop-blur-sm backdrop-filter">
              <div className="text-3xl italic text-white-900 flex items-center justify-center h-full">
                <IconLoader2 className="h-10 w-10 animate-spin" />
                <span> &nbsp; Loading...</span>
              </div>
            </div>
          )} */}
          {sudoku?.map((rowVal, rowId) => (
            <div key={rowId} className="flex h-full w-full">
              {rowVal.map((colVal, colId) => (
                <div key={colId} className="flex h-full w-full items-center justify-center">
                  <Cell
                    colId={colId}
                    colVal={colVal}
                    rowId={rowId}
                    handleChangeInput={handleChangeInput}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-full items-center justify-between pt-1 text-sm">
          <span className="text-md flex tracking-tighter text-black">
            PeerID:
            <p className="text-yellow-600" style={{ marginLeft: "8px" }}>
              {peerId}
            </p>
          </span>
          <span className="flex text-lg tracking-tighter text-black">
            Mistakes:
            <p className="" style={{ marginLeft: "8px" }}>
              {`${mistakes}/5`}
            </p>
          </span>
        </div>
        {connection && (
          <span className="flex text-sm tracking-tighter text-black">
            Connected to:
            <p className="text-yellow-600" style={{ marginLeft: "8px" }}>
              {connection.peer}
            </p>
          </span>
        )}
      </div>
      <div className="h-full px-4 text-center text-3xl font-bold text-blue-600">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div>
      <audio ref={booRef}>
        <source src={booPath} type="audio/mp3" />
      </audio>
      <audio ref={hornRef}>
        <source src={hornPath} type="audio/mp3" />
      </audio>
      {isWinner !== null && <Modal mistakes={mistakes} />}
    </div>
  );
}

export default Sudoku;
