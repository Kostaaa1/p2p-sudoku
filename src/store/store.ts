import Peer, { DataConnection } from "peerjs";
import { create } from "zustand";

type TUseStore = {
  peerId: string;
  setPeerId: (id: string) => void;
  connection: DataConnection | null;
  setConnection: (val: DataConnection) => void;
  peer: Peer;
  // isWinner: boolean | null;
  // setIsWinner: (isWinner: boolean) => void;
  isCountdownActive: boolean;
  setIsCountdownActive: (val: boolean) => void;
  STARTING_TIME: string;
  END_TIME: string;
  time: string;
  setTime: (time: string) => void;
  isToastRan: boolean;
  setIsToastRan: (val: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
};

const STARTING_TIME = "15:00";
const END_TIME = "00:00";

const useStore = create<TUseStore>((set) => ({
  //// Countdown:
  STARTING_TIME,
  END_TIME,
  time: STARTING_TIME,
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
  /////
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
  // isWinner: null,
  // setIsWinner: (isWinner: boolean) =>
  //   set((state) => ({
  //     ...state,
  //     isWinner,
  //   })),
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
