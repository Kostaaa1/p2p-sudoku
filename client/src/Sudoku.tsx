import { useEffect, useRef } from "react";
import useSudoku from "./hooks/useSudoku";
import Cell from "./Cell";
import Modal from "./Modal";
import booPath from "./assets/boo.mp3";
import hornPath from "./assets/horn.mp3";
import usePeerStore from "./store/peerStore";
import { toastMessageConstructor } from "./utils/utils";
import useSudokuStore from "./store/sudokuStore";
import useCountdownStore from "./store/countdownStore";
import Countdown from "./Countdown";

function Sudoku() {
  const booRef = useRef<HTMLAudioElement>(null);
  const hornRef = useRef<HTMLAudioElement>(null);

  const { isToastRan, connection, peerId } = usePeerStore();
  const { isCountdownActive, setIsCountdownActive } = useCountdownStore();
  const {
    mistakes,
    incrementMistakes,
    invalidCells,
    sudoku,
    setIsWinner,
    isWinner,
    initInvalidCellsLength,
  } = useSudokuStore();
  const { allCellsFilled } = useSudoku();

  useEffect(() => {
    if (!isCountdownActive && sudoku) {
      setIsCountdownActive(true);
    }
  }, [sudoku]);

  useEffect(() => {
    if (allCellsFilled && mistakes < 5 && invalidCells.length === 0) {
      setIsWinner(true);
    }

    if (
      mistakes < 5 &&
      invalidCells &&
      invalidCells.length > 0 &&
      initInvalidCellsLength !== invalidCells.length
    ) {
      incrementMistakes();
    }
  }, [invalidCells, initInvalidCellsLength]);

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
      booRef.current.volume = 0.0;
      booRef.current.play();

      connection?.send({
        type: "end_game",
        data: {
          isWinner: false,
          message: "Time's up, you both lost, or tied idk...",
        },
      });

      toastMessageConstructor({
        winner: isWinner,
        message: "Times up, you lost! Try Again.",
      });
    }

    if (booRef.current && mistakes === 5 && isWinner === false) {
      booRef.current.volume = 0.0;
      booRef.current.play();

      connection?.send({
        type: "end_game",
        data: {
          isWinner: !isWinner,
          message: "Youu won! The opponent made 5 mistakes!",
        },
      });

      toastMessageConstructor({
        winner: isWinner,
        message: "You have made 5 mistakes, you are done! Try Again",
      });
    }

    if (hornRef.current && isWinner) {
      hornRef.current.volume = 0.0;
      hornRef.current.play();

      connection?.send({
        type: "end_game",
        data: {
          isWinner: !isWinner,
          message: "You lost. The opponent solved before you!",
        },
      });

      toastMessageConstructor({
        winner: isWinner,
        message: "You Won!!!",
      });
    }
  }, [isToastRan, isWinner, mistakes]);

  return (
    <div className="flex items-center justify-center font-semibold text-blue-600">
      <div className="h-full px-4 text-center text-3xl font-bold text-blue-600">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div>
      <div>
        <Countdown />
        <div className="relative flex h-[540px] w-[540px] flex-col items-center justify-center overflow-hidden border-2 border-blue-800">
          {/* <div className="absolute top-0 h-full w-full border border-gray-100 bg-gray-800 bg-opacity-10 bg-clip-padding backdrop-blur-sm backdrop-filter"></div> */}
          {sudoku?.map((rowVal, rowId) => (
            <div key={rowId} className="flex h-full w-full">
              {rowVal.map((colVal, colId) => (
                <div
                  key={colId}
                  className="flex h-full w-full items-center justify-center"
                >
                  <Cell colId={colId} colVal={colVal} rowId={rowId} />
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
