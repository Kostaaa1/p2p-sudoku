import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sudoku from "./pages/Sudoku";
import Modes from "./pages/Modes";
import PeerConnection from "./pages/PeerConnection";
import useSudokuStore from "./store/sudokuStore";
import { Toaster } from "react-hot-toast";
import usePeerStore from "./store/peerStore";
import { useEffect } from "react";
import useSudoku from "./hooks/useSudoku";
import { PeerResponse } from "./types/types";
import useCountdownStore from "./store/countdownStore";
import booPath from "./assets/boo.mp3";
import hornPath from "./assets/horn.mp3";

function App() {
  const location = useLocation();
  const { isWinner } = useSudokuStore();
  const navigate = useNavigate();

  const { peer, setConnection, setPeerId, setIsOpponentReady } = usePeerStore();
  const { setSudoku, setIsWinner, setIsToastRan, toastMessageConstructor } = useSudokuStore();
  const { setIsCountdownActive, updateCountdown } = useCountdownStore();
  const { resetGame, booRef, hornRef } = useSudoku();

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

          resetGame(difficulty);
          setSudoku(board);
        }

        if (type === "ready") {
          setIsOpponentReady(data);
        }

        if (type === "end_game") {
          const { isWinner, message } = data;
          setIsCountdownActive(false);
          setIsWinner(isWinner);
          toastMessageConstructor(isWinner, message);
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
