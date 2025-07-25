import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createRoom, getRoom, joinRoom } from "./gameManager.js";
import { getRandomCards } from "./cardData.js";
import axios from "axios"; // Make sure to install axios

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

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
    if (!room) return callback({ error: "Room not found" });

    callback({
      players: room.players,
      currentTurn: room.currentTurn,
      host: room.host,
    });
  });

  socket.on("startGame", (pin) => {
    const room = getRoom(pin);
    if (!room) return;

    room.stage = "picking";
    room.cardOptions = getRandomCards();
    room.guesses = {};
    room.selectedCard = null;

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
    room.guessTimer = null;

    io.to(pin).emit("startGuessing", {
      selectedBy: room.players[room.currentTurn].name,
      timeLimit: 15,
    });

    // Start guessing phase timer
    room.guessTimer = setTimeout(() => {
      finishGuessingPhase(room, pin);
    }, 15000);
  });

  socket.on("submitGuess", ({ pin, playerName, guess }) => {
    const room = getRoom(pin);
    if (!room) return;

    if (!room.guesses[playerName]) {
      room.guesses[playerName] = [];
    }

    room.guesses[playerName].push({
      text: guess,
      time: Date.now(),
    });
  });

  async function finishGuessingPhase(room, pin) {
    room.stage = "showingResult";

    // Prepare all guesses for scoring
    const allGuessesForScoring = {};
    for (const [player, guesses] of Object.entries(room.guesses)) {
      allGuessesForScoring[player] = guesses.map((g) => g.text);
    }

    try {
      const response = await axios.post("http://0.0.0.0:8000/similarity", {
        target: room.selectedCard,
        guesses: allGuessesForScoring,
      });
      console.log("response: ", response.data);
      const { winner, results } = response.data;

      // Build all guesses with their similarity
      const scoredGuesses = Object.entries(room.guesses).flatMap(
        ([playerName, guesses], index) => {
          return guesses.map((g, idx) => ({
            playerName,
            guess: g.text,
            similarity: results[playerName][idx].similarity,
            time: g.time,
          }));
        }
      );

      // Sort all guesses by similarity (descending)
      const rankedGuesses = [...scoredGuesses].sort(
        (a, b) => b.similarity - a.similarity
      );

      // Emit to clients
      io.to(pin).emit("showResult", {
        correctAnswer: room.selectedCard,
        allGuesses: scoredGuesses, // For displaying full history
        rankedGuesses, // For leaderboard / ranking display
        winner,
      });
    } catch (err) {
      console.error("Similarity API error:", err);
      io.to(pin).emit("errorMsg", "Scoring failed");
      return;
    }

    // Prepare next round
    /* setTimeout(() => {
      room.currentTurn = (room.currentTurn + 1) % room.players.length;
      room.cardOptions = getRandomCards();
      room.stage = "picking";

      io.to(pin).emit("nextTurn", {
        currentPlayer: room.players[room.currentTurn].name,
        cards: room.cardOptions,
      });
    }, 5000);*/
  }

  socket.on("next-round", ({ pin }) => {
    const room = getRoom(pin);
    if (!room) return;

    room.currentTurn = (room.currentTurn + 1) % room.players.length;
    room.cardOptions = getRandomCards();
    room.selectedCard = null;
    room.guesses = {};
    room.stage = "picking";

    io.to(pin).emit("nextTurn", {
      currentPlayer: room.players[room.currentTurn].name,
      cards: room.cardOptions,
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    // TODO: Handle player leave logic here (optional)
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
