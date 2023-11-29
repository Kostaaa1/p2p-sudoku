import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/peerStore";
import { toastMessageConstructor, updateCountdown } from "../utils/utils";
import { PeerResponse } from "../types/types";
import useSudokuStore from "../store/sudokuStore";
import useCountdownStore from "../store/countdownStore";

const usePeer = () => {
  const navigate = useNavigate();
  const { setIsWinner, setSudoku } = useSudokuStore();
  const { setIsToastRan, connection, peer, setConnection } = useStore();
  const { setTime, setIsCountdownActive } = useCountdownStore();

  const navigateToSudoku = () => {
    localStorage.clear();
    navigate("/sudoku");
  };

  useEffect(() => {
    if (connection) navigateToSudoku();
  }, [connection]);

  const handleConnect = (id: string) => {
    if (!id || id.length === 0) return;
    const conn = peer?.connect(id);

    if (conn) {
      conn.on("open", () => {
        console.log("Connection opened to peer: " + conn.peer);
        navigateToSudoku();
      });

      conn.on("data", (res) => {
        const { data, type } = res as PeerResponse;
        console.log("connection data recieved", data);

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

        if (type === "sudoku") {
          console.log("got from: ", data);
          setSudoku(data);
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
