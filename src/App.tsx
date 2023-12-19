import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sudoku from "./pages/Sudoku";
import Modes from "./pages/Modes";
import PeerConnection from "./pages/PeerConnection";
import useSudokuStore from "./store/sudokuStore";
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();
  const { isWinner } = useSudokuStore();

  return (
    <>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Modes />} />
        <Route path="/sudoku/peer-connect" element={<PeerConnection />} />
        <Route path="/sudoku" element={<Sudoku />} />
      </Routes>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName="width: 200px"
        containerStyle={{}}
        toastOptions={{
          duration: 5000,
          style: {
            background: !isWinner ? "#ef4443" : "#00ba0fac",
            fontWeight: "bold",
            color: "#fff",
            maxWidth: "100%",
          },
        }}
      />
    </>
  );
}

export default App;
