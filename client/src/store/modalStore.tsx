import { create } from "zustand";

type TModalStore = {
  modalMsg: string;
  buttonText: string;
  modalHeader: string;
  actions: {
    setButtonText: (txt: string) => void;
    setModalMsg: (msg: string) => void;
    setModalHeader: (head: string) => void;
  };
};

const useModalStore = create<TModalStore>((set) => ({
  modalMsg: "",
  modalHeader: "",
  buttonText: "",
  actions: {
    setModalMsg: (modalMsg: string) => set({ modalMsg }),
    setModalHeader: (modalHeader: string) => set({ modalHeader }),
    setButtonText: (buttonText: string) => set({ buttonText }),
  },
}));

export default useModalStore;
