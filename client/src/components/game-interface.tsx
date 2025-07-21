import { useState, useEffect } from "react";
import socket from "@/utils/socket";
import { Button } from "@/components/ui/button";

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
  const [cards, setCards] = useState(initialCards);
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
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
        console.log("CORRECT ANSWER: ", correctAnswer);
        console.log("WINNER: ", winner);
        setPhase("results");
      }
    );

    socket.on("nextTurn", ({ currentPlayer: nextPlayer, cards: newCards }) => {
      // Reset state for the next round
      setCurrentPlayer(nextPlayer);
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
    <div className="p-6">
      <h2 className="text-xl mb-4">Current Player: {currentPlayer}</h2>

      {phase === "picking" && (
        <>
          {playerName === currentPlayer ? (
            <div>
              <h3 className="mb-2">Pick a cardd:</h3>
              {cards.map((card) => (
                <Button
                  key={card.id}
                  onClick={() => handlePickCard(card)}
                  className="m-2"
                >
                  {card}
                </Button>
              ))}
            </div>
          ) : (
            <p>Waiting for {currentPlayer} to pick a card...</p>
          )}
        </>
      )}

      {phase === "guessing" && (
        <div>
          <h3>Guess the word! Time left: {timer}s</h3>
          {playerName !== currentPlayer ? (
            <div>
              <input
                value={playerGuess}
                onChange={(e) => setPlayerGuess(e.target.value)}
                placeholder="Your guess"
                className="border p-2 m-2"
              />
              <Button onClick={submitGuess}>Submit</Button>
            </div>
          ) : (
            <p>You picked the word. Waiting for others to guess...</p>
          )}
        </div>
      )}

      {phase === "results" && (
        <div>
          <h3>The word was: {selectedCard?.word}</h3>
          <h4>Guesses:</h4>
          {guesses.map((g, i) => (
            <div key={i}>
              {g.playerName} guessed "{g.guess}"
            </div>
          ))}
          {playerName === currentPlayer && (
            <Button
              onClick={() => socket.emit("next-round", { pin: gameCode })}
            >
              Next Round
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
