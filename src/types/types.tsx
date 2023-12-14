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

export type DifficultySet = {
  type: "difficulty";
  id: number;
  data: "easy" | "medium" | "hard";
  clicked: boolean;
};

export type TParsedGameCache = {
  sudoku: string[][];
  invalidCells: TCell[];
  addedCells: TCell[];
  mistakes: number;
  isWinner: boolean | null;
  time: string | null;
};

export type TimeLimitSet = {
  type: "time_limit";
  id: number;
  data: "12" | "15" | "20";
  clicked: boolean;
};
export type DataSet = DifficultySet | TimeLimitSet;
export type ArrowFunctions = {
  [key: string]: () => void;
};
