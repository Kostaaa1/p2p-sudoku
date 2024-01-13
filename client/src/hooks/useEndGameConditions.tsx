import { useEffect, useMemo, useRef } from "react";
import useCountdownStore from "../store/countdownStore";
import useSocketStore from "../store/socketStore";
import useMistakesStore from "../store/mistakesStore";
import useToastStore from "../store/toastStore";
import useSudokuStore from "../store/sudokuStore";
import useGameStateStore from "../store/gameStateStore";
import { useInvalidCells } from "../store/cellStore";
import { useSocket } from "../context/SocketProvider";

const useEndGameConditions = () => {
  const booRef = useRef<HTMLAudioElement>(null);
  const hornRef = useRef<HTMLAudioElement>(null);

  const player2 = useSocketStore((state) => state.player2);
  const mistakes = useMistakesStore((state) => state.mistakes);

  const isCountdownActive = useCountdownStore(
    (state) => state.isCountdownActive,
  );
  const { setIsCountdownActive } = useCountdownStore((state) => state.actions);

  const isToastRan = useToastStore((state) => state.isToastRan);
  const { callSuccessToast, callErrorToast } = useToastStore(
    (state) => state.actions,
  );

  const invalidCells = useInvalidCells();
  const sudoku = useSudokuStore((state) => state.sudoku);
  const isWinner = useGameStateStore((state) => state.isWinner);
  const { setIsWinner } = useGameStateStore((state) => state.actions);
  const socket = useSocket();

  //////////////////////////////////////
  const allCellsFilled = useMemo(() => {
    return sudoku?.flat().every((x) => x !== "");
  }, [sudoku]);
  //////////////////////////////////////

  ///// Winning/Losing conditions: /////
  useEffect(() => {
    if (allCellsFilled && mistakes < 5 && invalidCells.length === 0)
      setIsWinner(true);
  }, [allCellsFilled]);

  useEffect(() => {
    if (mistakes === 5) setIsWinner(false);
  }, [mistakes]);

  useEffect(() => {
    if (isWinner === null || isToastRan) return;
    setIsCountdownActive(false);
    if (booRef.current && mistakes < 5 && isWinner === false) {
      booRef.current.volume = 0.1;
      booRef.current.play();
      callErrorToast(isWinner, "Times up, you lost! Try Again.");
      socket?.emit("endGame", {
        player: player2,
        isWinner: false,
        message: "Time's up, you both lost, or tied idk...",
      });
    }

    if (booRef.current && mistakes === 5 && isWinner === false) {
      booRef.current.volume = 0.1;
      booRef.current.play();
      callErrorToast(isWinner, "You have made 5 mistakes, you lost! Try Again");
      socket?.emit("endGame", {
        player: player2,
        isWinner: !isWinner,
        message: "Youu won! The opponent made 5 mistakes!",
      });
    }

    if (hornRef.current && isWinner) {
      hornRef.current.volume = 0.1;
      hornRef.current.play();
      callSuccessToast(isWinner, "You Won!!!");
      socket?.emit("endGame", {
        player: player2,
        isWinner: !isWinner,
        message: "You lost. The opponent solved before you!",
      });
    }
  }, [isWinner, isToastRan, isCountdownActive]);

  return { booRef, hornRef, isToastRan };
};

export default useEndGameConditions;
