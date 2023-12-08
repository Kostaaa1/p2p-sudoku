import usePeerStore from "../store/peerStore";
import useSudokuStore from "../store/sudokuStore";
import { SudokuCacheMap, SudokuCacheMapKeys } from "../types/types";

const useLocalStorage = () => {
  const { difficulty } = useSudokuStore();
  const getCached = <T extends SudokuCacheMapKeys>(
    key: T,
  ): SudokuCacheMap[T]["data"] => {
    1;
    const cachedAdded = localStorage.getItem(key);

    if (cachedAdded) {
      return JSON.parse(cachedAdded);
    } else {
      switch (key) {
        case "added":
        case "invalid":
          return [] as SudokuCacheMap[T]["data"];
        case "mistakes":
          return 0 as SudokuCacheMap[T]["data"];
        case "countdown":
          return STARTING_TIME as SudokuCacheMap[T]["data"];
        case "is_winner":
          return null as SudokuCacheMap[T]["data"];
        case "game": {
          const board = generateSudokuBoard(difficulty);
          cache({ key: "game", data: board });
          return board as SudokuCacheMap[T]["data"];
        }
        default:
          return "";
      }
    }
  };

  const cache = ({ key, data }: SudokuCacheMap[keyof SudokuCacheMap]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error caching key ${key}`, error);
    }
  };

  return {
    getCached,
    cache,
  };
};

export default useLocalStorage;
