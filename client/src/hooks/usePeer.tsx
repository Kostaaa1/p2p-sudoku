import { useNavigate } from "react-router-dom";
import usePeerStore from "../store/peerStore";
import { toastMessageConstructor } from "../utils/utils";
import { PeerResponse } from "../types/types";
import useSudokuStore from "../store/sudokuStore";
import useCountdownStore from "../store/countdownStore";
import { generateSudokuBoard } from "../utils/generateSudoku";

const usePeer = () => {
  const navigate = useNavigate();
  const { setIsWinner, setSudoku, difficulty } = useSudokuStore();
  const { setIsToastRan, peer, setConnection, setIsOpponentReady } =
    usePeerStore();
  const { setIsCountdownActive, updateCountdown } = useCountdownStore();

  const handleConnect = (id: string) => {
    if (id.length === 0) return;

    const conn = peer.connect(id);

    if (conn) {
      conn.on("open", () => {
        if (difficulty) {
          const board = generateSudokuBoard(difficulty);
          setSudoku(board);

          conn.send({ type: "sudoku", data: board });
          navigate("/sudoku");
        }
      });

      conn.on("data", (res) => {
        const { data, type } = res as PeerResponse;

        if (type === "end_game") {
          const { isWinner, message } = data;

          setIsCountdownActive(false);
          toastMessageConstructor({ winner: isWinner, message });
          setIsToastRan(true);
          setIsWinner(isWinner);
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
