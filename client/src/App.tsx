import { Route, Routes, useNavigate } from "react-router-dom";
import Sudoku from "./pages/Sudoku";
import Modes from "./pages/Modes";
import PeerConnection from "./pages/PeerConnection";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useCountdownStore from "./store/countdownStore";
import useGameStateStore from "./store/gameStateStore";
import useSocketStore from "./store/socketStore";
import useSudokuStore from "./store/sudokuStore";
import useEndGameConditions from "./hooks/useEndGameConditions";
import booPath from "./assets/boo.mp3";
import hornPath from "./assets/horn.mp3";
import { useSocket } from "./context/SocketProvider";
import { generateSudokuBoard } from "./utils/generateSudoku";
import { DifficultySet } from "./types/types";

function App() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { booRef, hornRef } = useEndGameConditions();
  const { setTime, decrementCountdown } = useCountdownStore(
    (state) => state.actions,
  );
  // const time = useCountdownStore((state) => state.time);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const { setSudoku } = useSudokuStore((state) => state.actions);
  const { setIsWinner, setDifficulty } = useGameStateStore(
    (state) => state.actions,
  );
  const player1 = useSocketStore((state) => state.player1);
  const player2 = useSocketStore((state) => state.player2);
  const roomId = useSocketStore((state) => state.roomId);
  const { setPlayer1, setPlayer2, setRoomId } = useSocketStore(
    (state) => state.actions,
  );

  // socket test:
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Connected to socket");
    });

    socket.on("clientId", (clientData) => {
      console.log("clientD  data ", clientData);
      const { room, type, difficulty } = clientData;
      switch (type) {
        case "client":
          setPlayer1(room);
          break;
        case "room":
          setRoomId(room);
          setPlayer2(clientData.player);
          socket?.emit("joinRoom", { room, player: null, difficulty });
          break;
      }
    });

    socket.on("onJoin", (roomData) => {
      console.log("onJoin: ", roomData);
      const { room, player, difficulty } = roomData;
      const board = generateSudokuBoard(difficulty);
      const newData = { board, difficulty };
      socket.emit("roomData", { room, data: newData });
    });

    socket.on("countdown", () => {
      decrementCountdown();
    });

    socket.on(
      "endGame",
      (data: { player: string; message: string; isWinner: boolean }) => {
        console.log("endGame", data);
      },
    );

    socket.on(
      "roomData",
      (roomData: {
        room: string;
        data: { board: string[][]; difficulty: DifficultySet["data"] };
      }) => {
        console.log("roomData: ", roomData);
        const { data, room } = roomData;
        const { board, difficulty } = data;
        setSudoku(board);
        setDifficulty(difficulty);
        setTime(difficulty);
        navigate("/sudoku");
      },
    );

    return () => {
      socket.disconnect();
      console.log("Disconnected from socket");
    };
  }, [socket]);

  return (
    <>
      <div className="flex h-full w-screen items-center justify-center">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Modes />} />
          <Route path="/sudoku/peer-connect" element={<PeerConnection />} />
          <Route path="/sudoku" element={<Sudoku />} />
          <Route path="/sudoku/:roomId" element={<Sudoku />} />
        </Routes>
      </div>
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
