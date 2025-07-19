import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createRoom, getRoom, joinRoom } from "./gameManager.js";
import { getRandomCards } from "./cardData.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// HTTP endpoints for creating/joining games
app.post("/create", (req, res) => {
  const { name } = req.body;
  const room = createRoom(name);
  res.json({ pin: room.pin });
});

app.post("/join", (req, res) => {
  const { pin, name } = req.body;
  const room = joinRoom(pin, name);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ success: true });
});

// Socket.io logic
io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("joinRoom", ({ pin, name }) => {
    const room = getRoom(pin);
    if (!room) {
      socket.emit("errorMsg", "Room not found");
      return;
    }

    const player = room.players.find((p) => p.name === name);
    if (player) player.id = socket.id;

    socket.join(pin);
    io.to(pin).emit("roomUpdate", room.players);
  });

  socket.on("getRoomInfo", (pin, callback) => {
    const room = getRoom(pin);
    if (!room) {
      return callback({ error: "Room not found" });
    }

    callback({
      players: room.players,
      currentTurn: room.currentTurn,
      host: room.host, // Include host info here
    });
  });

  socket.on("startGame", (pin) => {
    const room = getRoom(pin);
    if (!room) return;

    room.stage = "picking";
    room.cardOptions = getRandomCards();

    io.to(pin).emit("gameStart", {
      currentPlayer: room.players[room.currentTurn].name,
      cards: room.cardOptions,
    });
  });

  socket.on("pickCard", ({ pin, card }) => {
    const room = getRoom(pin);
    if (!room) return;

    room.selectedCard = card;
    room.stage = "guessing";
    room.guesses = {};

    io.to(pin).emit("startGuessing", {
      selectedBy: room.players[room.currentTurn].name,
      timeLimit: 15, // seconds
    });

    setTimeout(() => {
      room.stage = "showingResult";
      io.to(pin).emit("showResult", {
        correctAnswer: card,
        guesses: room.guesses,
      });

      // Advance turn
      room.currentTurn = (room.currentTurn + 1) % room.players.length;
      room.cardOptions = getRandomCards();
      room.stage = "picking";

      setTimeout(() => {
        io.to(pin).emit("nextTurn", {
          currentPlayer: room.players[room.currentTurn].name,
          cards: room.cardOptions,
        });
      }, 5000); // Show results for 5s
    }, 15000); // 15s guessing phase
  });

  socket.on("submitGuess", ({ pin, playerName, guess }) => {
    const room = getRoom(pin);
    if (!room) return;

    room.guesses[playerName] = guess;
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    // Optionally handle player leave logic here
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
