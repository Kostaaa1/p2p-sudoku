import { useNavigate } from "react-router-dom";
import usePeerStore from "../store/peerStore";
import { PeerResponse } from "../types/types";
import useSudokuStore from "../store/sudokuStore";
import useCountdownStore from "../store/countdownStore";
import { generateSudokuBoard } from "../utils/generateSudoku";
import useToastStore from "../store/toastStore";
import useGameStateStore from "../store/gameStateStore";

const usePeer = () => {
  const navigate = useNavigate();
  const { setSudoku } = useSudokuStore((state) => state.actions);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const { setIsWinner } = useGameStateStore((state) => state.actions);
  const { setIsCountdownActive, updateCountdown } = useCountdownStore(
    (state) => state.actions
  );
  const { setIsToastRan, callErrorToast, callSuccessToast } = useToastStore(
    (state) => state.actions
  );
  const peer = usePeerStore((state) => state.peer);
  const { setIsOpponentReady, setConnection } = usePeerStore((state) => state.actions);

  // const { resetGame } = useSudoku();
  const handleConnect = (id: string) => {
    if (id.length === 0) return;
    const conn = peer.connect(id);
    if (conn) {
      conn.on("open", () => {
        if (difficulty) {
          // resetGame(difficulty);
          const board = generateSudokuBoard(difficulty);
          setSudoku(board);
          conn.send({ type: "sudoku", data: { board, difficulty } });
          navigate("/sudoku");
        }
      });
      conn.on("data", (res) => {
        const { data, type } = res as PeerResponse;
        if (type === "end_game") {
          const { isWinner, message } = data;
          setIsCountdownActive(false);
          setIsToastRan(true);
          setIsWinner(isWinner);

          if (isWinner === true) callSuccessToast(isWinner, message);
          if (isWinner === false) callErrorToast(isWinner, message);
        }
        if (type === "ready") {
          console.log("ready data from usePeer", res);
          setIsOpponentReady(data);
        }
        if (type === "countdown") {
          updateCountdown(data);
        }
      });
      conn.on("error", (err) => {
        console.log("this is error:", err);
      });
      setConnection(conn);
    }
  };
  return { handleConnect };
};

export default usePeer;
