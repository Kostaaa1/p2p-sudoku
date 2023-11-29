import { Route, Routes, useLocation } from "react-router-dom";
import Sudoku from "./Sudoku";
import Modes from "./Modes";
import PeerConnection from "./PeerConnection";
import { useEffect } from "react";
import useStore from "./store/peerStore";
import { toastMessageConstructor, updateCountdown } from "./utils/utils";
import { PeerResponse } from "./types/types";
import useSudokuStore from "./store/sudokuStore";
import useCountdownStore from "./store/countdownStore";
import { generateSudokuBoard } from "./utils/generateSudoku";

function App() {
  const location = useLocation();

  const { connection, setIsToastRan, peer, setConnection, setPeerId } =
    useStore();
  const { setIsWinner, resetGame, setSudoku } = useSudokuStore();
  const { setTime, setIsCountdownActive } = useCountdownStore();

  useEffect(() => {
    peer.on("open", (id) => {
      console.log("this is my peer id on OPEN:", id);
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      console.log("On connection", conn, "peer: ", conn.peer);
      setConnection(conn);

      conn.on("data", (res) => {
        const { data, type } = res as PeerResponse;
        console.log("connection data recieved");

        if (type === "sudoku") {
          setSudoku(data);
        }

        if (type === "end_game") {
          const { isWinner, message } = data;
          console.log("toast: ", message);

          setIsCountdownActive(false);
          setIsWinner(isWinner);

          toastMessageConstructor({ winner: isWinner, message });
          setIsToastRan(true);
        }

        if (type === "countdown") {
          updateCountdown(data, setTime);
        }
      });
    });

    return () => {
      peer.destroy();
    };
  }, [peer]);

  useEffect(() => {
    console.log("NEW connection ACHIVED");
    if (connection) {
      resetGame();
      const board = generateSudokuBoard();
      console.log(board);

      // connection?.send({
      //   type: "sudoku",
      //   data: board,
      // });
    }
  }, [connection]);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Modes />} />
      <Route path="/sudoku/peer-connect" element={<PeerConnection />} />
      <Route path="/sudoku" element={<Sudoku />} />
    </Routes>
  );
}

export default App;
