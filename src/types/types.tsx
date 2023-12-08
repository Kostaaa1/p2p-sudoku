export type TCell = {
  col: number;
  row: number;
  value: string;
};
export type PeerResponse =
  | {
      type: "countdown";
      data: number;
    }
  | {
      type: "ready";
      data: boolean;
    }
  | {
      type: "end_game";
      data: { isWinner: boolean; message: string };
    }
  | {
      type: "sudoku";
      data: string[][];
    }
  | {
      type: "opponent_peer_id";
      data: string;
    };

export type SudokuCacheMap = {
  countdown: { key: "countdown"; data: string };
  game: { key: "game"; data: string[][] };
  invalid: { key: "invalid"; data: TCell[] };
  mistakes: { key: "mistakes"; data: number };
  added: { key: "added"; data: TCell[] };
  is_winner: { key: "is_winner"; data: boolean | null };
};

export type SudokuCacheMapKeys = keyof SudokuCacheMap;

export type DifficultySet = {
  type: "difficulty";
  id: number;
  data: "Easy" | "Medium" | "Hard";
  clicked: boolean;
};

export type TimeLimitSet = {
  type: "time_limit";
  id: number;
  data: "12" | "15" | "20";
  clicked: boolean;
};

export type DataSet = DifficultySet | TimeLimitSet;
