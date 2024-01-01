export type TFocusedCell = {
  row: number;
  col: number;
  value?: string;
};
export type TCell = TFocusedCell & { value: string };

export type TAnimationCellType = "row" | "col" | "grid";
export type TAnimationData = {
  [key in TAnimationCellType]: boolean;
};
export type TStyleCellType = {
  [key in TAnimationCellType]: string;
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
      data: { board: string[][]; difficulty: DifficultySet["data"] };
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

export type TUnifiedGame = {
  sudoku: string[][];
  invalidCells: TCell[];
  insertedCells: TCell[];
  mistakes: number;
  isWinner: boolean | null;
  time: string;
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
