import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function GuessingPhase({
  currentPlayer,
  playerName,
  timer,
  guesses,
  playerGuess,
  setPlayerGuess,
  submitGuess,
}) {
  const isCurrentPlayer = playerName === currentPlayer;
  const hasGuessed = guesses.some((g) => g.playerName === playerName);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <div className="text-lg font-semibold mb-2">
              {isCurrentPlayer
                ? "You picked the word. Waiting for others to guess..."
                : "Guess the word!"}
            </div>
            <Progress value={((15 - timer) / 15) * 100} className="w-full" />
            <div className="text-sm text-gray-500 mt-1">
              Time left: {timer}s
            </div>
          </div>

          {!isCurrentPlayer && (
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                placeholder="Your guess"
                value={playerGuess}
                onChange={(e) => setPlayerGuess(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && submitGuess()}
                disabled={hasGuessed}
              />
              <Button
                onClick={submitGuess}
                disabled={!playerGuess.trim() || hasGuessed}
              >
                Submit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {guesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Guesses So Far ({guesses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {guesses.map((guess, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium">{guess.playerName}</span>
                  <span className="text-gray-600">Submitted guess</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
