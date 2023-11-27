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
export type SudokuCache =
  | { key: "countdown"; data: string }
  | { key: "game"; data: string[][] }
  | { key: "invalid"; data: TCell[] }
  | { key: "mistakes"; data: number }
  | { key: "is_winner"; data: boolean | null }
  | { key: "added"; data: TCell[] };

export type SudokuCacheTypes = SudokuCache["key"];
