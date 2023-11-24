import { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import useSudoku from "./hooks/useSudoku";
import Countdown from "./Countdown";
import Cell from "./Cell";
import Modal from "./Modal";
import booPath from "./assets/boo.mp3";
import hornPath from "./assets/horn.mp3";
import useStore from "./store/store";
import { toastMessageConstructor } from "./utils/utils";
import { PeerResponse } from "./types/types";
import useSudokuStore from "./store/sudokuStore";

function Sudoku() {
  const booRef = useRef<HTMLAudioElement>(null);
  const hornRef = useRef<HTMLAudioElement>(null);

  const {
    isToastRan,
    connection,
    peerId,
    isModalOpen,
    setIsModalOpen,
    isCountdownActive,
    setIsCountdownActive,
  } = useStore();

  const {
    mistakes,
    incrementMistakes,
    focusedCell,
    setFocusedCell,
    invalidCells,
    addedCells,
    sudoku,
    setIsWinner,
    isWinner,
  } = useSudokuStore();

  const { inputRefs, focusInput, handleChangeInput, allCellsFilled } =
    useSudoku();

  const closeModal = () => setIsModalOpen(false);
  useEffect(() => {
    if (!isCountdownActive && sudoku) {
      setIsCountdownActive(true);
    }
  }, [sudoku]);

  // Conditions For winning or losing, need to make ite better.
  // If mistake has been made, increment it. At 5 mistakes, game is over
  useEffect(() => {
    // Winning condition:
    if (allCellsFilled && mistakes < 5 && invalidCells.length === 0) {
      setIsWinner(true);
    }

    // Incremented mistakes
    if (mistakes < 5 && invalidCells && invalidCells.length > 0) {
      console.log("ran");
      incrementMistakes();
    }
  }, [invalidCells]);

  useEffect(() => {
    // Lost condition, 5 Mistakes:
    if (mistakes === 5) {
      setIsWinner(false);
    }
  }, [mistakes]);

  useEffect(() => {
    if (isWinner === null || isToastRan) return;
    setIsCountdownActive(false);
    setIsModalOpen(true);

    if (booRef.current && mistakes < 5 && isWinner === false) {
      booRef.current.volume = 0.1;
      booRef.current.play();

      connection?.send({
        type: "end_game_condition",
        data: {
          isWinner: false,
          message: "Time's up, you both lost, or tied idk...",
        },
      } as PeerResponse);

      toastMessageConstructor({
        winner: isWinner,
        message: "Times up, you lost! Try Again.",
      });
    }

    if (booRef.current && mistakes === 5 && isWinner === false) {
      booRef.current.volume = 0.1;
      booRef.current.play();

      connection?.send({
        type: "end_game_condition",
        data: {
          isWinner: !isWinner,
          message: "Youu won! The opponent made 5 mistakes!",
        },
      } as PeerResponse);

      toastMessageConstructor({
        winner: isWinner,
        message: "You have made 5 mistakes, you are done! Try Again",
      });
    }

    if (hornRef.current && isWinner) {
      hornRef.current.volume = 0.1;
      hornRef.current.play();

      connection?.send({
        type: "end_game_condition",
        data: {
          isWinner: !isWinner,
          message: "You lost. The opponent solved before you!",
        },
      } as PeerResponse);

      toastMessageConstructor({
        winner: isWinner,
        message: "You Won!!!",
      });
    }
  }, [isToastRan, isWinner, mistakes]);

  return (
    <div className="flex items-center text-blue-600">
      <div className="text-center font-bold text-3xl text-blue-600 px-4 h-full ">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div>
      <div>
        <Countdown />
        <div className="flex h-[540px] w-[540px] flex-col items-center justify-center overflow-hidden border-2 border-blue-800">
          {sudoku.map((rowVal, rowId) => (
            <div key={rowId} className="flex h-full w-full">
              {rowVal.map((colVal, colId) => (
                <div
                  key={colId}
                  className="flex h-full w-full items-center justify-center"
                >
                  <Cell
                    handleChangeInput={handleChangeInput}
                    colId={colId}
                    colVal={colVal}
                    rowId={rowId}
                    invalidCells={invalidCells}
                    addedCells={addedCells}
                    focusedCell={focusedCell}
                    setFocusedCell={setFocusedCell}
                    inputRefs={inputRefs}
                    focusInput={focusInput}
                    isWinner={isWinner}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="text-sm flex w-full pt-1 items-center justify-between">
          <span className="flex tracking-tighter text-black text-md font-semibold">
            PeerID:{" "}
            <p
              className="text-yellow-600 font-bold"
              style={{ marginLeft: "8px" }}
            >
              {peerId}
            </p>
          </span>
          <span className="flex tracking-tighter text-black text-lg font-semibold">
            Mistakes:{" "}
            <p className="font-bold" style={{ marginLeft: "8px" }}>
              {`${mistakes}/5`}
            </p>
          </span>
        </div>
        {connection && (
          <span className="flex tracking-tighter text-black text-sm font-semibold">
            Connected to:{" "}
            <p
              className="text-yellow-600 font-bold"
              style={{ marginLeft: "8px" }}
            >
              {connection.peer}
            </p>
          </span>
        )}
      </div>
      <div className="text-center font-bold text-3xl text-blue-600 px-4 h-full ">
        S<br></br>U<br></br>D<br></br>O<br></br>K<br></br>U<br></br>
      </div>
      <audio ref={booRef}>
        <source src={booPath} type="audio/mp3" />
      </audio>
      <audio ref={hornRef}>
        <source src={hornPath} type="audio/mp3" />
      </audio>
      {isWinner !== null && isModalOpen && (
        <Modal closeModal={closeModal} mistakes={mistakes} />
      )}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName="width: 200px"
        containerStyle={{}}
        toastOptions={{
          duration: 5000,
          style: {
            background: !isWinner ? "#ef4443" : "#00ba0fac",
            fontWeight: "bold",
            color: "#fff",
            maxWidth: "100%",
          },
        }}
      />
    </div>
  );
}

export default Sudoku;
