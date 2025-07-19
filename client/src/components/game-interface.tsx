import socket from "@/utils/socket";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users } from "lucide-react";

interface Player {
  id: number;
  name: string;
  isReady: boolean;
}

interface GameInterfaceProps {
  playerName: string;
  players: Player[];
  gameCode: string;
}

interface GameCard {
  id: number;
  word: string;
  category: string;
}

interface Guess {
  playerId: number;
  playerName: string;
  guess: string;
  similarity: number;
}

const gameCards: GameCard[] = [
  { id: 1, word: "Elephant", category: "Animals" },
  { id: 2, word: "Pizza", category: "Food" },
  { id: 3, word: "Guitar", category: "Music" },
  { id: 4, word: "Ocean", category: "Nature" },
  { id: 5, word: "Rocket", category: "Space" },
  { id: 6, word: "Castle", category: "Buildings" },
];

export default function GameInterface({
  playerName,
  gameCode,
  players,
}: GameInterfaceProps) {
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [gamePhase, setGamePhase] = useState<
    "waiting" | "guessing" | "results"
  >("waiting");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [playerGuess, setPlayerGuess] = useState("");

  useEffect(() => {
    // Listen for game events
    socket.on("new-round", ({ card, currentPlayer }) => {
      setCurrentCard(card);
      setCurrentPlayer(currentPlayer);
      setGamePhase("guessing");
      setGuesses([]);
    });

    socket.on("round-results", (results) => {
      setGuesses(results);
      setGamePhase("results");
    });

    return () => {
      socket.off("new-round");
      socket.off("round-results");
    };
  }, []);

  const submitGuess = () => {
    if (playerGuess.trim()) {
      socket.emit("submit-guess", { gameCode, playerName, guess: playerGuess });
      setPlayerGuess("");
    }
  };

  return (
    <div className="p-4">
      {gamePhase === "guessing" && currentCard && (
        <>
          <h2>Category: {currentCard.category}</h2>
          {currentPlayer === playerName ? (
            <p>You are the card holder. Wait for others to guess.</p>
          ) : (
            <div>
              <input
                value={playerGuess}
                onChange={(e) => setPlayerGuess(e.target.value)}
                placeholder="Your guess"
              />
              <button onClick={submitGuess}>Submit Guess</button>
            </div>
          )}
        </>
      )}

      {gamePhase === "results" && (
        <div>
          <h2>The word was: {currentCard?.word}</h2>
          <h3>Results:</h3>
          {guesses.map((g) => (
            <div key={g.playerId}>
              {g.playerName} guessed "{g.guess}" ({g.similarity}%)
            </div>
          ))}
          <button onClick={() => socket.emit("next-round", { gameCode })}>
            Next Round
          </button>
        </div>
      )}
    </div>
  );
}
