import Peer, { DataConnection } from "peerjs";
import { create } from "zustand";

type TPeerStoreActions = {
  setPeerId: (id: string) => void;
  setConnection: (val: DataConnection | null) => void;
  setIsOpponentReady: (isReady: boolean) => void;
};

type TPeerStore = {
  peer: Peer;
  peerId: string;
  connection: DataConnection | null;
  isOpponentReady: boolean;
  actions: TPeerStoreActions;
};

const usePeerStore = create<TPeerStore>((set) => ({
  peer: new Peer(),
  peerId: "",
  connection: null,
  isOpponentReady: false,
  actions: {
    setPeerId: (peerId: string) =>
      set((state) => ({
        ...state,
        peerId,
      })),
    setConnection: (connection: DataConnection | null) =>
      set((state) => ({
        ...state,
        connection: connection,
      })),
    setIsOpponentReady: (isOpponentReady: boolean) => set({ isOpponentReady }),
  },
}));

export default usePeerStore;
