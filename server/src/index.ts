import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import "dotenv/config";
const { CLIENT_URL } = process.env;

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
// Initially on reander, the serever socket sends socket id and imm joins the room
// TODO: connect 2 sockets to one room, so they can have shared data:
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

  socket.on("roomData", (roomData) => {
    console.log("roomData called", roomData);
    io.to(roomData.room).emit("roomData", roomData);
  });

  socket.on("countdown", (room) => {
    io.to(room).emit("countdown");
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected with custom ID: ${socket.id}`);
  });
});

// Routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Yooo from test route." });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
