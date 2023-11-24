import { useEffect } from "react";
import { TCell } from "../types/types";
import useSudokuStore from "../store/sudokuStore";

const useLocalStorage = () => {
  const { mistakes, invalidCells, addedCells, sudoku } = useSudokuStore();
  const clearCache = () => {
    localStorage.clear();
  };

  const getCachedMistakes = () => {
    const cachedGame = localStorage.getItem("mistakes");
    if (cachedGame) {
      return JSON.parse(cachedGame);
    } else {
      return null;
    }
  };

  const getCachedGame = () => {
    const cachedGame = localStorage.getItem("game");
    if (cachedGame) {
      return JSON.parse(cachedGame);
    } else {
      return null;
    }
  };

  const getCachedInvalid = () => {
    const cachedInvalids = localStorage.getItem("invalid");
    if (cachedInvalids) {
      return JSON.parse(cachedInvalids);
    } else {
      return null;
    }
  };

  const getCachedAdded = () => {
    const cachedAdded = localStorage.getItem("added");
    if (cachedAdded) {
      return JSON.parse(cachedAdded);
    } else {
      return null;
    }
  };

  const cacheMistakes = (number: number) =>
    localStorage.setItem("mistakes", JSON.stringify(number));

  const cacheGame = (game: string[][]) =>
    localStorage.setItem("game", JSON.stringify(game));

  const cacheInvalid = (invalid: TCell[]) =>
    localStorage.setItem("invalid", JSON.stringify(invalid));

  const cacheAdded = (added: TCell[]) =>
    localStorage.setItem("added", JSON.stringify(added));

  useEffect(() => {
    console.log("ran caching");
    cacheInvalid(invalidCells);
    cacheAdded(addedCells);
    cacheGame(sudoku);
    cacheMistakes(mistakes);
  }, [mistakes, addedCells, invalidCells, sudoku]);

  return {
    getCachedMistakes,
    cacheMistakes,
    getCachedGame,
    getCachedInvalid,
    getCachedAdded,
    clearCache,
    cacheGame,
    cacheInvalid,
    cacheAdded,
  };
};

export default useLocalStorage;
