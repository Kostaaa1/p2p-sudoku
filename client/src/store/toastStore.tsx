import { create } from "zustand";
import toast from "react-hot-toast";

type TUseToastStore = {
  isToastRan: boolean;
  actions: {
    setIsToastRan: (val: boolean) => void;
    // callToast: (winner: boolean, message: string) => void;
    callErrorToast: (winner: boolean, message: string) => void;
    callSuccessToast: (winner: boolean, message: string) => void;
  };
};

const useToastStore = create<TUseToastStore>((set) => ({
  isToastRan: false,
  actions: {
    setIsToastRan: (isToastRan: boolean) => set({ isToastRan }),
    callErrorToast: (winner: boolean, message: string) => {
      const emoji = winner ? "🎉🎉🎉" : "😢😢😢";
      const newMessage = `${emoji}${message}${emoji}`;
      toast.error(newMessage);
      set({ isToastRan: true });
    },
    callSuccessToast: (winner: boolean, message: string) => {
      const emoji = winner ? "🎉🎉🎉" : "😢😢😢";
      const newMessage = `${emoji}${message}${emoji}`;
      toast.success(newMessage);
      set({ isToastRan: true });
    },
  },
}));

export default useToastStore;
