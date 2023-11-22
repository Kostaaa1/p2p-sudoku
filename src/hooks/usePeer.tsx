import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/store";
import { toastMessageConstructor, updateCountdown } from "../utils/utils";
import { PeerResponse } from "../types/types";

const usePeer = () => {
  const navigate = useNavigate();
  const {
    setIsToastRan,
    setIsWinner,
    setTime,
    connection,
    peer,
    setIsCountdownActive,
    setIsModalOpen,
    setConnection,
  } = useStore();

  useEffect(() => {
    // if (!connection) return;
    if (connection) navigate("/sudoku");
  }, [connection]);

  const handleConnect = (id: string) => {
    if (!id || id.length === 0) return;
    const conn = peer?.connect(id);

    if (conn) {
      conn.on("open", () => {
        console.log("Connection opened to peer: " + conn.peer);
        navigate("/sudoku");
      });

      conn.on("data", (res) => {
        const { data, type } = res as PeerResponse;

        if (type === "end_game_condition") {
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
