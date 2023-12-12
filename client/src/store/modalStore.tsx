import { create } from "zustand";

type TModalStore = {
  modalMsg: string;
  setModalMsg: (msg: string) => void;
  buttonText: string;
  setButtonText: (txt: string) => void;
};

const useModalStore = create<TModalStore>((set) => ({
  modalMsg: "",
  setModalMsg: (modalMsg: string) => set({ modalMsg }),
  buttonText: "",
  setButtonText: (buttonText: string) => set({ buttonText }),
}));

export default useModalStore;
