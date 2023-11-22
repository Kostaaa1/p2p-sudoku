import { useNavigate } from "react-router-dom";

const Modes = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-14 text-5xl font-bold italic text-blue-600 underline">
        Sudoku
      </h1>
      <div className="border-1 flex h-20 items-center justify-center border border-gray-200 p-4 shadow-md shadow-gray-400">
        <button
          onClick={() => navigate("/sudoku")}
          className="mr-2 bg-blue-600"
        >
          Play Alone
        </button>
        <button
          onClick={() => navigate("/sudoku/peer-connect")}
          className="bg-green-600"
        >
          Play With a friend
        </button>
      </div>
    </div>
  );
};

export default Modes;
