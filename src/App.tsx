import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sudoku from "./Sudoku";
import Modes from "./Modes";
import PeerConnection from "./PeerConnection";
import { useEffect } from "react";
import usePeerStore from "./store/peerStore";
import { toastMessageConstructor } from "./utils/utils";
import { PeerResponse } from "./types/types";
import useSudokuStore from "./store/sudokuStore";
import useCountdownStore from "./store/countdownStore";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    setIsToastRan,
    peer,
    setConnection,
    setPeerId,
    setIsOpponentReady,
    isOpponentReady,
  } = usePeerStore();
  const { resetGame, setSudoku, setIsWinner } = useSudokuStore();
  const { setIsCountdownActive, updateCountdown } = useCountdownStore();

  useEffect(() => {
    peer.on("open", (id) => {
      console.log("this is my peer id on OPEN:", id);
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      console.log("On connection", conn, "peer: ", conn.peer);
      setConnection(conn);
      resetGame();
      navigate("/sudoku");

      conn.on("data", (res) => {
        const { data, type } = res as PeerResponse;

        if (type === "sudoku") {
          setSudoku(data);
        }

        if (type === "ready") {
          console.log("ready data from APp", res);
          setIsOpponentReady(data);
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
          updateCountdown(data);
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
