const Keyboard = () => {
  return (
    <div className="my-2 flex w-full outline outline-black outline-1 justify-between items-center h-full">
      {Array.from({ length: 9 }, (_, y) => y + 1).map((key) => (
        <div
          key={key}
          className="text-blue-600 text-2xl w-14 h-14 outline outline-1 cursor-pointer hover:bg-blue-600 hover:bg-opacity-40 outline-black flex items-center justify-center font-bold transition-all duration-100"
        >
          {key}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
