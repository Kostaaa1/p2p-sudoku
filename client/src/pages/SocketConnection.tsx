import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DifficultySet } from "../types/types";
import { IconCheck } from "@tabler/icons-react";
import usePeerStore from "../store/socketStore";
import useGameStateStore from "../store/gameStateStore";
import { useSocket } from "../context/SocketProvider";
import { cn } from "../utils/utils";

const SocketConnection = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string>("");
  const navigate = useNavigate();
  const player1 = usePeerStore((state) => state.player1);
  const { setPlayer2, setRoomId } = usePeerStore((state) => state.actions);
  const [isCopyClicked, setIsCopyClicked] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const PAGE_LIMIT = 2;
  const { setDifficulty } = useGameStateStore((state) => state.actions);
  const difficulty = useGameStateStore((state) => state.difficulty);
  const socket = useSocket();
  const [difficultyData, setDifficultyData] = useState<DifficultySet[]>([
    { id: 0, type: "difficulty", data: "easy", clicked: true },
    { id: 1, type: "difficulty", data: "medium", clicked: false },
    { id: 2, type: "difficulty", data: "hard", clicked: false },
  ]);

  useEffect(() => {
    setDifficultyData((state) =>
      state.map((x) => ({ ...x, clicked: difficulty === x.data })),
    );
  }, [difficulty]);

  const handleSocketConnection = (p2Id: string) => {
    const newRoomId = [player1 + p2Id].sort().join("");
    console.log("called handleSocketConnection", newRoomId);
    setPlayer2(p2Id);
    setRoomId(newRoomId);
    socket?.emit("joinRoom", { room: newRoomId, player: p2Id, difficulty });
  };

  const copyPeerId = () => {
    if (player1) {
      navigator.clipboard.writeText(player1);
      setIsCopyClicked(true);
    }
  };

  const difficultyBtnClick = (id: number) => {
    const selectedDif = difficultyData.find((x) => x.id === id);
    if (selectedDif) {
      setDifficulty(selectedDif.data);
    }
    setDifficultyData((state) =>
      state.map((x) => ({ ...x, clicked: x.id === id })),
    );
  };

  const nextPage = () => {
    if (player1 && input.length >= player1.length && page < PAGE_LIMIT) {
      setPage((state) => state + 1);
    }
  };

  const prevPage = () => {
    if (page >= 0) {
      setPage((state) => state - 1);
    }
  };

  return (
    <div className="flex h-max w-[520px] flex-col justify-between whitespace-nowrap rounded-md bg-slate-200 p-3 font-bold text-gray-600 shadow-md shadow-gray-500 outline outline-1 outline-white">
      {page === 0 && (
        <>
          <div className="flex w-full items-center justify-between">
            <div className="inline-flex justify-between">
              <label>My peer id: &nbsp;</label>
              <p className="text-yellow-600 underline">{player1}</p>
            </div>
            <div className="flex items-center justify-center">
              {isCopyClicked && <IconCheck className="mr-1 text-green-600" />}
              <button
                className="bg-slate-400 text-sm text-white"
                onClick={copyPeerId}
              >
                Copy
              </button>
            </div>
          </div>
          <div className="flex w-full items-center justify-center py-2">
            <label>Connect to id: </label>
            <input
              ref={inputRef}
              autoFocus
              type="text"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Id"
              className="ml-2 h-7 w-full bg-white pl-2 outline outline-2 outline-gray-300"
            />
          </div>
        </>
      )}
      {page === 1 && (
        <div>
          <p className="inline-flex w-full items-center justify-center">
            Before you start, select the game difficulty:
          </p>
          <div className="my-2 flex w-full justify-between">
            {difficultyData.map((x, id) => (
              <button
                key={x.id}
                onClick={() => difficultyBtnClick(x.id)}
                className={cn(
                  "w-full bg-slate-400 text-sm text-white transition-all duration-200 hover:bg-green-600",
                  id % 2 !== 0 && "mx-2",
                  x.clicked && "bg-green-600",
                )}
              >
                {x.data.charAt(0).toUpperCase() + x.data.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        className="h-8 bg-slate-400 text-sm text-white"
        onClick={() =>
          page === 0 ? nextPage() : handleSocketConnection(input)
        }
      >
        {page === 0 ? "Continue" : "Connect"}
      </button>
      <button
        className="flex h-8 items-center justify-center bg-red-400 text-sm text-white transition-colors duration-200 [--p:259_94%_51%]"
        onClick={() => (page === 0 ? navigate(-1) : prevPage())}
      >
        Go Back
      </button>
    </div>
  );
};

export default SocketConnection;
