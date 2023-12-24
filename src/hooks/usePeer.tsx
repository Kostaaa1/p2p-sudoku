import { useNavigate } from "react-router-dom";
import usePeerStore from "../store/peerStore";
import { PeerResponse } from "../types/types";
import useSudokuStore from "../store/sudokuStore";
import useCountdownStore from "../store/countdownStore";
import { generateSudokuBoard } from "../utils/generateSudoku";
import useSudoku from "./useSudoku";

const usePeer = () => {
  const navigate = useNavigate();
  const { setIsToastRan, setIsWinner, setSudoku, difficulty, toastMessageConstructor } =
    useSudokuStore();
  const { peer, setConnection, setIsOpponentReady } = usePeerStore();
  const { setIsCountdownActive, updateCountdown } = useCountdownStore();
  const { resetGame } = useSudoku();
  const handleConnect = (id: string) => {
    if (id.length === 0) return;
    const conn = peer.connect(id);
    if (conn) {
      conn.on("open", () => {
        if (difficulty) {
          resetGame(difficulty);
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
          toastMessageConstructor(isWinner, message);
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
