import { TCell } from "../types/types";

const useLocalStorage = () => {
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

  const cacheMistakes = (number: number) => {
    localStorage.setItem("mistakes", JSON.stringify(number));
  };

  const cacheGame = (game: string[][]) =>
    localStorage.setItem("game", JSON.stringify(game));

  const cacheInvalid = (invalid: TCell[]) =>
    localStorage.setItem("invalid", JSON.stringify(invalid));

  const cacheAdded = (added: TCell[]) =>
    localStorage.setItem("added", JSON.stringify(added));

  // useEffect(() => {
  //   console.log("invalid cached:");
  //   cacheInvalid(invalidCells);
  // }, [invalidCells]);

  // useEffect(() => {
  //   console.log("added cached:");
  // const data =
  // cacheAdded(addedCells);
  // }, [addedCells]);

  // useEffect(() => {
  //   console.log("sudoku cached:");
  //   cacheGame(sudoku);
  // }, [sudoku]);

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
