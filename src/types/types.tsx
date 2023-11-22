export type TCell = {
  col: number;
  row: number;
  value: string;
};

type PeerEndGameData = {
  type: "end_game_condition";
  data: { isWinner: boolean; message: string };
};

type PeerCountdown = {
  type: "countdown";
  data: number;
};

export type PeerResponse = PeerCountdown | PeerEndGameData;
