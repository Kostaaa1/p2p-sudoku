import { Route, Routes, useLocation } from "react-router-dom";
import Sudoku from "./Sudoku";
import Modes from "./Modes";
import PeerConnection from "./PeerConnection";
import { useEffect } from "react";
import useStore from "./store/store";
import { toastMessageConstructor, updateCountdown } from "./utils/utils";
import { PeerResponse } from "./types/types";
import useSudokuStore from "./store/sudokuStore";

function App() {
  const location = useLocation();

  const {
    setIsToastRan,
    setTime,
    peer,
    setIsCountdownActive,
    setConnection,
    setPeerId,
  } = useStore();
  const { setIsWinner } = useSudokuStore();

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

        if (type === "end_game") {
          const { isWinner, message } = data;
          console.log("toast: ", message);
          setIsCountdownActive(false);

          toastMessageConstructor({ winner: isWinner, message });
          setIsToastRan(true);

          setIsWinner(isWinner);
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

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Modes />} />
      <Route path="/sudoku/peer-connect" element={<PeerConnection />} />
      <Route path="/sudoku" element={<Sudoku />} />
    </Routes>
  );
}

export default App;
