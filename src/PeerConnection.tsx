import { useRef, useState } from "react";
import usePeer from "./hooks/usePeer";
import useStore from "./state/peerStore";
import { useNavigate } from "react-router-dom";
import useSudokuStore from "./state/sudokuStore";

const PeerConnection = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string>("");
  const { handleConnect } = usePeer();
  const navigate = useNavigate();
  const { peerId } = useStore();
  const { resetGame } = useSudokuStore();

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
  };

  return (
    <div className="flex h-max w-[520px] flex-col justify-between whitespace-nowrap rounded-md bg-slate-200 p-3 font-semibold text-gray-600 shadow-md shadow-gray-500 outline outline-1 outline-white">
      <div className="flex w-full items-center justify-between">
        <div className="inline-flex">
          <label className="font-semibold">My peer id: &nbsp;</label>
          <p className="font-bold text-yellow-600 underline">{peerId}</p>
        </div>
        <button
          className="bg-slate-400 text-sm text-white"
          onClick={copyPeerId}
        >
          Copy
        </button>
      </div>
      <div className="">
        <div className="flex w-full items-center justify-center py-2">
          <label className="font-semibold">Connect to id: </label>
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
      </div>
      <button
        className="bg-slate-400 text-sm text-white"
        onClick={() => {
          resetGame();
          handleConnect(input);
        }}
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
