import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sudoku from "./pages/Sudoku";
import Modes from "./pages/Modes";
import SocketConnection from "./pages/SocketConnection";
import { Toaster } from "react-hot-toast";
import { useCallback, useEffect } from "react";
import useCountdownStore from "./store/countdownStore";
import useGameStateStore from "./store/gameStateStore";
import useSocketStore from "./store/socketStore";
import useSudokuStore from "./store/sudokuStore";
import useEndGameConditions from "./hooks/useEndGameConditions";
import booPath from "./assets/boo.mp3";
import hornPath from "./assets/horn.mp3";
import { useSocket } from "./context/SocketProvider";
import { generateSudokuBoard } from "./utils/generateSudoku";
import { DifficultySet, TUnifiedGame } from "./types/types";
import useToastStore from "./store/toastStore";
import { countdownSet, emptySudoku } from "./store/constants";
import {
  useInsertedCellsActions,
  useInvalidCellsActions,
  useSingleCellActions,
} from "./store/cellStore";
import useMistakesStore from "./store/mistakesStore";

function App() {
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const { booRef, hornRef } = useEndGameConditions();
  const { decrementTime } = useCountdownStore((state) => state.actions);
  const { setSudoku } = useSudokuStore((state) => state.actions);
  const { setIsWinner, setDifficulty } = useGameStateStore(
    (state) => state.actions,
  );
  const { setIsCountdownActive, setTime, updateCountdown } = useCountdownStore(
    (state) => state.actions,
  );
  const { setIsOpponentReady, setPlayer1, setPlayer2, setRoomId } =
    useSocketStore((state) => state.actions);
  const { callSuccessToast, callErrorToast } = useToastStore(
    (state) => state.actions,
  );
  const { setInvalidCells, resetInvalidCells } = useInvalidCellsActions();
  const { setMistakes, resetMistakes } = useMistakesStore(
    (state) => state.actions,
  );
  const { setInsertedCells, resetInsertedCells } = useInsertedCellsActions();
  const { setFocusedCell } = useSingleCellActions();
  const { setIsToastRan } = useToastStore((state) => state.actions);

  const setAll = (mainGame: string) => {
    const parsedData: TUnifiedGame = JSON.parse(mainGame);
    const { time, insertedCells, invalidCells, isWinner, mistakes, sudoku } =
      parsedData;

    updateCountdown(time);
    setInvalidCells(invalidCells);
    setInsertedCells(insertedCells);
    setIsWinner(isWinner);
    setSudoku(sudoku);
    setMistakes(mistakes);
    setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
  };

  const resetGameState = (difficulty: DifficultySet["data"]) => {
    localStorage.removeItem("main_game");
    setIsToastRan(false);
    setIsCountdownActive(true);
    setIsOpponentReady(false);
    resetMistakes();
    resetInsertedCells();
    resetInvalidCells();
    setTime(difficulty);
    setIsWinner(null);
  };

  const getEmptyUnifiedGame = useCallback(
    (difficulty: DifficultySet["data"]) => {
      const emptyGame: TUnifiedGame = {
        sudoku: emptySudoku,
        insertedCells: [],
        invalidCells: [],
        isWinner: null,
        mistakes: 0,
        time: countdownSet[difficulty],
      };
      return emptyGame;
    },
    [],
  );

  const startNewGame = (diff: DifficultySet["data"], sudoku?: string[][]) => {
    resetGameState(diff);
    const emptyGame = getEmptyUnifiedGame(diff);
    const newGame = sudoku || generateSudokuBoard(diff);
    setAll(JSON.stringify({ ...emptyGame, sudoku: newGame }));
  };

  // socket test:
  useEffect(() => {
    if (!socket) return;
    socket.on("connect", () => {
      console.log("Connected to socket");
    });

    socket.on("clientId", (clientData) => {
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
      const { room, difficulty } = roomData;
      const board = generateSudokuBoard(difficulty);
      const newData = { board, difficulty };
      socket.emit("roomData", { room, data: newData });
    });

    socket.on("countdown", () => {
      decrementTime();
    });

    socket.on(
      "endGame",
      (data: { player: string; message: string; isWinner: boolean }) => {
        console.log("endGame", data);
        const { isWinner, message } = data;
        setIsWinner(isWinner);
        setIsCountdownActive(false);
        isWinner
          ? callSuccessToast(isWinner, message)
          : callErrorToast(isWinner, message);
      },
    );

    socket.on("isOpponentReady", () => {
      console.log("Opponent is ready");
      setIsOpponentReady(true);
    });

    socket.on(
      "roomData",
      (roomData: { board: string[][]; difficulty: DifficultySet["data"] }) => {
        const { board, difficulty } = roomData;
        resetGameState(difficulty);
        setSudoku(board);
        setDifficulty(difficulty);
        setTime(difficulty);

        if (location.pathname !== "/sudoku") {
          navigate("/sudoku");
        }
      },
    );
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <>
      <div className="flex h-full w-screen items-center justify-center">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Modes />} />
          <Route path="/sudoku/peer-connect" element={<SocketConnection />} />
          <Route
            path="/sudoku"
            element={<Sudoku startNewGame={startNewGame} setAll={setAll} />}
          />
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
