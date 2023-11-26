import Peer, { DataConnection } from "peerjs";
import { create } from "zustand";
import { getCached } from "../utils/utils";

type TUseStore = {
  peerId: string;
  setPeerId: (id: string) => void;
  connection: DataConnection | null;
  setConnection: (val: DataConnection) => void;
  peer: Peer;
  isCountdownActive: boolean;
  setIsCountdownActive: (val: boolean) => void;
  time: string;
  setTime: (time: string) => void;
  isToastRan: boolean;
  setIsToastRan: (val: boolean) => void;
  startingTime: string;
  setStartingTime: (val: string) => void;
  END_TIME: string;
};

const STARTING_TIME = "15:00";
const END_TIME = "00:00";

const startingTime = getCached("countdown") || STARTING_TIME;

const useStore = create<TUseStore>((set) => ({
  //// Countdown:
  startingTime,
  setStartingTime: (startingTime: string) => set({ startingTime }),
  END_TIME,
  time: startingTime,
  setTime: (time: string) =>
    set((state) => ({
      ...state,
      time,
    })),
  isCountdownActive: true,
  setIsCountdownActive: (isCountdownActive: boolean) =>
    set((state) => ({
      ...state,
      isCountdownActive,
    })),
  //// Peer:
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
  ////
  isToastRan: false,
  setIsToastRan: (isToastRan: boolean) =>
    set((state) => ({
      ...state,
      isToastRan,
    })),
  // const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  isModalOpen: false,
  setIsModalOpen: (isModalOpen: boolean) =>
    set((state) => ({
      ...state,
      isModalOpen,
    })),
}));

export default useStore;
