import { useState, useEffect } from "react";
import socket from "@/utils/socket";
import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";
import { Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PickingPhase from "./picking-phase";
import GuessingPhase from "./guessing-phase";
import ResultsCard from "./results-phase";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";

interface Player {
  id: string;
  name: string;
  isReady: boolean;
}

interface GameCard {
  id: number;
  word: string;
  category: string;
}

interface Guess {
  playerName: string;
  guess: string;
  similarity: number;
}

interface GameInterfaceProps {
  playerName: string;
  players: Player[];
  gameCode: string;
  currentPlayer: string;
  cards: GameCard[];
}

export default function GameInterface({
  playerName,
  players,
  gameCode,
  currentPlayer: initialCurrentPlayer,
  cards: initialCards,
}: GameInterfaceProps) {
  const [phase, setPhase] = useState<"picking" | "guessing" | "results">(
    "picking"
  );
  const [currentPlayer, setCurrentPlayer] = useState(initialCurrentPlayer);
  const [currentRound, setCurrentRound] = useState(1);
  const [cards, setCards] = useState(initialCards);
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [rankedGuesses, setRankedGuesses] = useState<Guess[]>([]);
  const [playerGuess, setPlayerGuess] = useState("");
  const [timer, setTimer] = useState(15);

  useEffect(() => {
    socket.on("startGuessing", ({ timeLimit }) => {
      setPhase("guessing");
      setTimer(timeLimit);
    });

    /* socket.on("showResult", ({ correctAnswer, scoredGuesses, winner }) => {
      console.log("SCORED : ", scoredGuesses);
      setSelectedCard(correctAnswer);
      setGuesses(
        scoredGuesses.map(({ playerName, guess, similarity }) => ({
          playerName,
          guess,
          similarity,
        }))
      );
      setWinner(winner); // Optional, if you want to highlight winner
      setPhase("results");
    });*/

    socket.on(
      "showResult",
      ({ correctAnswer, allGuesses, rankedGuesses, winner }) => {
        setSelectedCard(correctAnswer);
        console.log("allGuesses: ", allGuesses);
        console.log("rankedGuesses: ", rankedGuesses);
        setRankedGuesses(rankedGuesses);
        console.log("CORRECT ANSWER: ", correctAnswer);
        console.log("WINNER: ", winner);
        setPhase("results");
      }
    );

    socket.on("nextTurn", ({ currentPlayer: nextPlayer, cards: newCards }) => {
      // Reset state for the next round
      setCurrentPlayer(nextPlayer);
      setCurrentRound((prev) => prev + 1);

      setCards(newCards);
      setSelectedCard(null);
      setGuesses([]);
      setPlayerGuess("");
      setPhase("picking");
    });

    return () => {
      socket.off("startGuessing");
      socket.off("showResult");
      socket.off("nextTurn");
    };
  }, []);

  useEffect(() => {
    if (phase === "guessing" && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase, timer]);

  const handlePickCard = (card: GameCard) => {
    setSelectedCard(card);
    socket.emit("pickCard", { pin: gameCode, card });
  };

  const submitGuess = () => {
    if (playerGuess.trim()) {
      socket.emit("submitGuess", {
        pin: gameCode,
        playerName,
        guess: playerGuess,
      });
      setPlayerGuess("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              Round {currentRound}
            </Badge>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm text-gray-600">
                {players.length} players
              </span>
            </div>
          </div>
          {phase === "guessing" && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-lg">{timer}s</span>
            </div>
          )}
        </div>

        {/* Current Player */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {currentPlayer === playerName
                ? "Your Turn!"
                : `${currentPlayer}'s Turn`}
            </CardTitle>
          </CardHeader>
        </Card>
        {phase === "picking" && (
          <PickingPhase
            currentPlayer={currentPlayer}
            playerName={playerName}
            cards={cards}
            handlePickCard={handlePickCard}
          />
        )}
        {phase === "guessing" && (
          <GuessingPhase
            currentPlayer={currentPlayer}
            playerName={playerName}
            timer={timer}
            guesses={guesses}
            playerGuess={playerGuess}
            setPlayerGuess={setPlayerGuess}
            submitGuess={submitGuess}
          />
        )}
        {phase === "results" && (
          <ResultsCard
            currentCard={selectedCard}
            rankedGuesses={rankedGuesses}
            onNextRound={() => socket.emit("next-round", { pin: gameCode })}
            isCurrentPlayer={playerName === currentPlayer}
          />
        )}
      </div>
    </div>
  );
}
