import { useRef } from "react";
import useSudoku from "../hooks/useSudoku";
import Cell from "../components/Cell";
import Modal from "../components/Modal";
import usePeerStore from "../store/peerStore";
import useSudokuStore from "../store/sudokuStore";
import Countdown from "../components/Countdown";
import DifficultyOptions from "../components/DifficultyOptions";
import useGenerateCellStyles from "../hooks/useGenerateCellStyles";
import { twMerge } from "tailwind-merge";
import useKeyboardArrows from "../hooks/useKeyboardArrows";

function Sudoku() {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const { connection, peerId } = usePeerStore();
  const { mistakes, sudoku, isWinner } = useSudokuStore();
  const { startNewGame, handleChangeInput } = useSudoku();

  const { handleInputClick } = useKeyboardArrows(inputRefs);
  const { generateBorderStyle, generateCellStateStyle, generateHighlightStyle } =
    useGenerateCellStyles();

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
                    handleInputClick={handleInputClick}
                    cellRef={(el: HTMLInputElement) =>
                      (inputRefs.current[rowId * 9 + colId] = el!)
                    }
                    className={twMerge(
                      generateBorderStyle(colId, rowId),
                      generateHighlightStyle(rowId, colId),
                      generateCellStateStyle(rowId, colId, colVal)
                    )}
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
      {isWinner !== null && <Modal mistakes={mistakes} />}
    </div>
  );
}

export default Sudoku;
