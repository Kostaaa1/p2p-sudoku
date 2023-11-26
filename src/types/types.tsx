export type TCell = {
  col: number;
  row: number;
  value: string;
};
type PeerEndGameData = {
  type: "end_game";
  data: { isWinner: boolean; message: string };
};
type PeerCountdown = {
  type: "countdown";
  data: number;
};
export type PeerResponse = PeerCountdown | PeerEndGameData;

// Local storage types:
type LSSudoku = {
  key: "game";
  data: string[][];
};
type LSInvalid = {
  key: "invalid";
  data: TCell[];
};
type LSAdded = {
  key: "added";
  data: TCell[];
};
type LSMistakes = {
  key: "mistakes";
  data: number;
};
type LSCountdown = {
  key: "countdown";
  data: string;
};
export type SudokuCache =
  | LSCountdown
  | LSSudoku
  | LSInvalid
  | LSMistakes
  | LSAdded;

// wtf is this
export type SudokuCacheTypes = SudokuCache["key"];
