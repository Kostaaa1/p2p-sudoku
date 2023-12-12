// import { useEffect } from "react";
// import useCountdownStore from "../store/countdownStore";
// import useSudokuStore from "../store/sudokuStore";
// import { TParsedGameCache } from "../types/types";
// import useSudoku from "./useSudoku";

// const usePersistStorage = () => {
//   const { resetGame } = useSudoku();
//   const {
//     sudoku,
//     invalidCells,
//     isWinner,
//     addedCells,
//     mistakes,
//     difficulty,
//     setSudoku,
//     setAddedCells,
//     setInvalidCells,
//     setFocusedCell,
//     setMistakes,
//     setIsWinner,
//     setInitInvalidCellsLength,
//   } = useSudokuStore();
//   const { setTime, time } = useCountdownStore();

//   const setAll = (data: string) => {
//     const parsed: TParsedGameCache = JSON.parse(data);
//     const { time, addedCells, invalidCells, isWinner, mistakes, sudoku } =
//       parsed;

//     if (time) setTime(time);
//     setInitInvalidCellsLength(invalidCells.length);
//     setFocusedCell({ row: 0, col: 0, value: sudoku[0][0] });
//     setAddedCells(addedCells);
//     setInvalidCells(invalidCells);
//     setSudoku(sudoku);
//     setMistakes(mistakes);
//     setIsWinner(isWinner);
//   };

//   useEffect(() => {
//     const func = () => {
//       if (!sudoku || !difficulty || addedCells.length === 0) return;

//       const data: TParsedGameCache = {
//         addedCells,
//         invalidCells,
//         isWinner,
//         mistakes,
//         sudoku,
//         time,
//       };

//       console.log("beforeunload called", data);
//       cacheGame(data);
//       setAll(JSON.stringify(data));
//     };

//     window.addEventListener("beforeunload", func);
//     return () => {
//       window.removeEventListener("beforeunload", func);
//     };
//   }, [addedCells, difficulty, invalidCells, time, sudoku, mistakes, isWinner]);

//   useEffect(() => {
//     const game = localStorage.getItem("main_game");
//     if (game) {
//       setAll(game);
//       return;
//     }

//     if (!difficulty) return;
//     const gameData = resetGame();
//     setAll(JSON.stringify(gameData));
//   }, [difficulty]);

//   const cacheGame = (data: TParsedGameCache) => {
//     localStorage.setItem("main_game", JSON.stringify(data));
//   };

//   return { cacheGame };
// };

// export default usePersistStorage;
