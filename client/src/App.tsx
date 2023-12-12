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
import { Toaster } from "react-hot-toast";
import useSudoku from "./hooks/useSudoku";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsToastRan, peer, setConnection, setPeerId, setIsOpponentReady } =
    usePeerStore();
  const { setSudoku, setIsWinner, isWinner } = useSudokuStore();
  const { setIsCountdownActive, updateCountdown } = useCountdownStore();
  const { resetGame } = useSudoku();

  useEffect(() => {
    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      setConnection(conn);
      resetGame();
      navigate("/sudoku");

      conn.on("data", (res) => {
        const { data, type } = res as PeerResponse;

        if (type === "sudoku") {
          setSudoku(data);
        }

        if (type === "ready") {
          setIsOpponentReady(data);
        }

        if (type === "end_game") {
          const { isWinner, message } = data;

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
    <>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Modes />} />
        <Route path="/sudoku/peer-connect" element={<PeerConnection />} />
        <Route path="/sudoku" element={<Sudoku />} />
      </Routes>
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
    </>
  );
}

export default App;
