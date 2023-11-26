import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/store";
import { toastMessageConstructor, updateCountdown } from "../utils/utils";
import { PeerResponse } from "../types/types";
import useSudokuStore from "../store/sudokuStore";

const usePeer = () => {
  const navigate = useNavigate();
  const { setIsWinner, setIsModalOpen } = useSudokuStore();
  const {
    setIsToastRan,
    setTime,
    connection,
    peer,
    setIsCountdownActive,
    setConnection,
  } = useStore();

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

        if (type === "end_game") {
          const { isWinner, message } = data;
          console.log("toast: ", message);

          setIsCountdownActive(false);
          setIsModalOpen(true);

          toastMessageConstructor({ winner: isWinner, message });
          setIsToastRan(true);

          setIsWinner(isWinner);
        }

        if (type === "countdown") {
          updateCountdown(data, setTime);
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
