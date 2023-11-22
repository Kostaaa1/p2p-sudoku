import toast from "react-hot-toast";

const format = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

export const updateCountdown = (
  time: number,
  setTime: (time: string) => void
) => {
  const formattedTime = format(time);
  setTime(formattedTime);
};

export const toastMessageConstructor = ({
  winner,
  message,
}: {
  winner: boolean;
  message: string;
}) => {
  const emoji = winner ? "🎉🎉🎉" : "😢😢😢";
  const newMessage = `${emoji}${message}${emoji}`;
  toast(newMessage);
};
