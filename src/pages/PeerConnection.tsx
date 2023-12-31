import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DifficultySet } from "../types/types";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import usePeerStore from "../store/peerStore";
import useGameStateStore from "../store/gameStateStore";
import usePeer from "../hooks/usePeer";

const PeerConnection = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string>("");
  const navigate = useNavigate();

  const connection = usePeerStore((state) => state.connection);
  const { setConnection } = usePeerStore((state) => state.actions);
  const peerId = usePeerStore((state) => state.peerId);

  const { handleConnect } = usePeer();
  const [isCopyClicked, setIsCopyClicked] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const PAGE_LIMIT = 2;

  const { setDifficulty } = useGameStateStore((state) => state.actions);

  const [difficultyData, setDifficultyData] = useState<DifficultySet[]>([
    { id: 0, type: "difficulty", data: "easy", clicked: true },
    { id: 1, type: "difficulty", data: "medium", clicked: false },
    { id: 2, type: "difficulty", data: "hard", clicked: false },
  ]);

  useEffect(() => {
    console.log("ran");
    localStorage.removeItem("difficulty");
    if (connection) {
      setConnection(null);
      connection.close();
      // setDifficulty();
    }
  }, []);

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    setIsCopyClicked(true);
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
    if (input.length >= peerId.length && page < PAGE_LIMIT) {
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
          <div
            onClick={() => navigate(-1)}
            className="mb-2 flex h-12 w-max cursor-pointer items-center text-black transition-all duration-150 hover:text-opacity-50 hover:underline"
          >
            <IconArrowLeft />
            Back
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="inline-flex justify-between">
              <label>My peer id: &nbsp;</label>
              <p className="text-yellow-600 underline">{peerId}</p>
            </div>
            {isCopyClicked && <IconCheck className="-mr-4 text-green-600" />}
            <button
              className="bg-slate-400 text-sm text-white"
              onClick={copyPeerId}
            >
              Copy
            </button>
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
                className={twMerge(
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
        className="bg-slate-400 text-sm text-white"
        onClick={() => (page === 0 ? nextPage() : handleConnect(input))}
      >
        {page === 0 ? "Connect" : "Continue"}
      </button>
      <button
        className="bg-red-400 text-sm text-white transition-colors duration-200 [--p:259_94%_51%]"
        onClick={() => (page === 0 ? navigate(-1) : prevPage())}
      >
        Go Back
      </button>
    </div>
  );
};

export default PeerConnection;
