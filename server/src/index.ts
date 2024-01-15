import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
const { CLIENT_URL } = process.env;
import "dotenv/config";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Init Socket:
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Prep:
// Sockets can be implemented better, maybe i do not need to join the sockets like this (in a single room), everything would probably work with only connecting one socket.id to another.
io.on("connection", (socket) => {
  socket.join(socket.id);
  socket.emit("clientId", { type: "client", room: socket.id });
  socket.on(
    "joinRoom",
    (roomData: { room: string; player: string | null; difficulty: string }) => {
      console.log("roomData dksoakdoksoakdok", roomData);
      const { player, room, difficulty } = roomData;
      // socket.leave(socket.id);
      socket.join(room);
      console.log(`User ${player} joined room: ${room}. Current socketId: ${socket.id}`);
      if (player) {
        io.to(player).emit("clientId", { type: "room", room, player: socket.id, difficulty });
      } else {
        io.to(socket.id).emit("onJoin", roomData);
      }
    }
  );

  socket.on("isOpponentReady", (player) => {
    io.to(player).emit("isOpponentReady");
  });

  socket.on("endGame", (data) => {
    const { player } = data;
    io.to(player).emit("endGame", data);
  });

  socket.on("roomData", (roomData: { room: string; data: any }) => {
    console.log("roomData called", roomData);
    io.to(roomData.room).emit("roomData", roomData.data);
  });

  socket.on("countdown", (room) => {
    io.to(room).emit("countdown");
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected with custom ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
