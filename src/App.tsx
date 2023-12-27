import { Route, Routes, useNavigate } from "react-router-dom";
import Sudoku from "./pages/Sudoku";
import Modes from "./pages/Modes";
import PeerConnection from "./pages/PeerConnection";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { PeerResponse } from "./types/types";
import useCountdownStore from "./store/countdownStore";
import useGameStateStore from "./store/gameStateStore";
import usePeerStore from "./store/peerStore";
import useSudokuStore from "./store/sudokuStore";
import useEndGameConditions from "./hooks/useEndGameConditions";
import booPath from "./assets/boo.mp3";
import hornPath from "./assets/horn.mp3";

function App() {
  const navigate = useNavigate();
  const { setIsWinner } = useGameStateStore((state) => state.actions);
  const peer = usePeerStore((state) => state.peer);
  const { setSudoku } = useSudokuStore((state) => state.actions);
  const { booRef, hornRef } = useEndGameConditions();
  const { updateCountdown } = useCountdownStore((state) => state.actions);
  const { setConnection, setPeerId, setIsOpponentReady } = usePeerStore(
    (state) => state.actions
  );

  useEffect(() => {
    peer.on("open", (id) => {
      console.log("this is my peer id on OPEN:", id);
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      // console.log("On connection", conn, "peer: ", conn.peer);
      setConnection(conn);
      navigate("/sudoku");

      conn.on("data", (res) => {
        const { data, type } = res as PeerResponse;
        if (type === "sudoku") {
          const { board, difficulty } = data;
          setSudoku(board);
          // resetGameState(difficulty);
        }

        if (type === "ready") {
          setIsOpponentReady(data);
        }

        if (type === "end_game") {
          const { isWinner, message } = data;
          setIsWinner(isWinner);
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
      <audio ref={booRef}>
        <source src={booPath} type="audio/mp3" />
      </audio>
      <audio ref={hornRef}>
        <source src={hornPath} type="audio/mp3" />
      </audio>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName="width: 200px"
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            fontWeight: "bold",
            color: "white",
            maxWidth: "100%",
          },
          error: {
            style: {
              background: "#ef4443",
            },
          },
          success: {
            style: {
              background: "#00ba0fac",
            },
          },
        }}
      />
    </>
  );
}

export default App;
