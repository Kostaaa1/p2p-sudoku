const useLocalStorage = () => {
  const clearCache = () => {
    localStorage.clear();
  };

  const getCachedMistakes = () => {
    const cachedGame = localStorage.getItem("mistakes");
    if (cachedGame) {
      return JSON.parse(cachedGame);
    } else {
      return null;
    }
  };

  const getCachedGame = () => {
    const cachedGame = localStorage.getItem("game");
    if (cachedGame) {
      return JSON.parse(cachedGame);
    } else {
      return null;
    }
  };

  const getCachedInvalid = () => {
    const cachedInvalids = localStorage.getItem("invalid");
    if (cachedInvalids) {
      return JSON.parse(cachedInvalids);
    } else {
      return null;
    }
  };

  const getCachedAdded = () => {
    const cachedAdded = localStorage.getItem("added");
    if (cachedAdded) {
      return JSON.parse(cachedAdded);
    } else {
      return null;
    }
  };

  return {
    getCachedMistakes,
    getCachedGame,
    getCachedInvalid,
    getCachedAdded,
    clearCache,
  };
};

export default useLocalStorage;
