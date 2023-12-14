import { useRef, useState } from "react";
import usePeer from "./hooks/usePeer";
import useStore from "./store/peerStore";
import { useNavigate } from "react-router-dom";
import useSudoku from "./hooks/useSudoku";
import { DifficultySet } from "./types/types";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import useSudokuStore from "./store/sudokuStore";

const PeerConnection = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string>("");
  const { handleConnect } = usePeer();
  const navigate = useNavigate();
  const { peerId } = useStore();
  const { resetGame } = useSudoku();
  const [isCopyClicked, setIsCopyClicked] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const PAGE_LIMIT = 2;
  // const { setDifficulty } = useSudokuStore();
  // const [difficultyData, setDifficultyData] = useState<DifficultySet[]>([
  //   { id: 0, type: "difficulty", data: "Easy", clicked: true },
  //   { id: 1, type: "difficulty", data: "Medium", clicked: false },
  //   { id: 2, type: "difficulty", data: "Hard", clicked: false },
  // ]);

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    setIsCopyClicked(true);
  };

  // const difficultyBtnClick = (id: number) => {
  //   const selectedDif = difficultyData.find((x) => x.id === id);
  //   if (selectedDif) {
  //     setDifficulty(selectedDif.data);
  //   }
  //   setDifficultyData((state) =>
  //     state.map((x) => ({ ...x, clicked: x.id === id })),
  //   );
  // };

  return (
    <div className="flex h-max w-[520px] flex-col justify-between whitespace-nowrap rounded-md bg-slate-200 p-3 font-bold text-gray-600 shadow-md shadow-gray-500 outline outline-1 outline-white">
      <div
        onClick={() => navigate(-1)}
        className="mb-2 flex h-12 w-max cursor-pointer items-center text-black transition-all duration-150 hover:text-opacity-50 hover:underline"
      >
        <IconArrowLeft />
        Back
      </div>
      {/* <div>
        <p className="">Difficulty:</p>
        <div className="flex w-full justify-between">
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
              {x.data}
            </button>
          ))}
        </div>
      </div> */}
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
          className="custom-input w-full"
        />
      </div>
      <button
        className="bg-slate-400 text-sm text-white"
        onClick={() => handleConnect(input)}
      >
        Connect
      </button>
      <button
        className="bg-red-400 text-sm text-white transition-colors duration-200 [--p:259_94%_51%]"
        onClick={() => navigate(-1)}
      >
        Go Back
      </button>
    </div>
  );
};

export default PeerConnection;
