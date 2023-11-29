import Peer, { DataConnection } from "peerjs";
import { create } from "zustand";

type TPeerStore = {
  peerId: string;
  setPeerId: (id: string) => void;
  connection: DataConnection | null;
  setConnection: (val: DataConnection) => void;
  peer: Peer;
  isToastRan: boolean;
  setIsToastRan: (val: boolean) => void;
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
  setConnection: (connection: DataConnection) =>
    set((state) => ({
      ...state,
      connection: connection,
    })),
  isToastRan: false,
  setIsToastRan: (isToastRan: boolean) =>
    set((state) => ({
      ...state,
      isToastRan,
    })),
}));

export default usePeerStore;
