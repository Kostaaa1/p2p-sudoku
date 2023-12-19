import Peer, { DataConnection } from "peerjs";
import { create } from "zustand";

type TPeerStore = {
  peerId: string;
  setPeerId: (id: string) => void;
  connection: DataConnection | null;
  setConnection: (val: DataConnection | null) => void;
  peer: Peer;
  isOpponentReady: boolean;
  setIsOpponentReady: (isReady: boolean) => void;
};

const usePeerStore = create<TPeerStore>((set) => ({
  peer: new Peer(),
  peerId: "",
  setPeerId: (peerId: string) =>
    set((state) => ({
      ...state,
      peerId,
    })),
  connection: null,
  setConnection: (connection: DataConnection | null) =>
    set((state) => ({
      ...state,
      connection: connection,
    })),
  isOpponentReady: false,
  setIsOpponentReady: (isOpponentReady: boolean) => set({ isOpponentReady }),
}));

export default usePeerStore;
