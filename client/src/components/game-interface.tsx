"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Users } from "lucide-react"

interface Player {
  id: number
  name: string
  isReady: boolean
}

interface GameInterfaceProps {
  playerName: string
  players: Player[]
}

interface GameCard {
  id: number
  word: string
  category: string
}

interface Guess {
  playerId: number
  playerName: string
  guess: string
  similarity: number
}

const gameCards: GameCard[] = [
  { id: 1, word: "Elephant", category: "Animals" },
  { id: 2, word: "Pizza", category: "Food" },
  { id: 3, word: "Guitar", category: "Music" },
  { id: 4, word: "Ocean", category: "Nature" },
  { id: 5, word: "Rocket", category: "Space" },
  { id: 6, word: "Castle", category: "Buildings" },
]

export default function GameInterface({ playerName, players }: GameInterfaceProps) {
  const [currentCard, setCurrentCard] = useState<GameCard>(gameCards[0])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gamePhase, setGamePhase] = useState<"playing" | "guessing" | "results">("playing")
  const [timeLeft, setTimeLeft] = useState(30)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [playerGuess, setPlayerGuess] = useState("")
  const [round, setRound] = useState(1)

  const currentPlayer = players[currentPlayerIndex]
  const isCurrentPlayer = currentPlayer.name === playerName

  // Calculate similarity percentage (simple implementation)
  const calculateSimilarity = (guess: string, target: string): number => {
    const g = guess.toLowerCase().trim()
    const t = target.toLowerCase().trim()

    if (g === t) return 100
    if (t.includes(g) || g.includes(t)) return 75

    // Simple character overlap calculation
    const gChars = new Set(g.split(""))
    const tChars = new Set(t.split(""))
    const intersection = new Set([...gChars].filter((x) => tChars.has(x)))
    const union = new Set([...gChars, ...tChars])

    return Math.round((intersection.size / union.size) * 100)
  }

  // Timer effect
  useEffect(() => {
    if (gamePhase === "guessing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gamePhase === "guessing" && timeLeft === 0) {
      setGamePhase("results")
    }
  }, [gamePhase, timeLeft])

  const handlePlayCard = () => {
    setGamePhase("guessing")
    setTimeLeft(30)
    setGuesses([])
    setPlayerGuess("")
  }

  const handleSubmitGuess = () => {
    if (playerGuess.trim()) {
      const similarity = calculateSimilarity(playerGuess, currentCard.word)
      const newGuess: Guess = {
        playerId: players.find((p) => p.name === playerName)?.id || 0,
        playerName,
        guess: playerGuess.trim(),
        similarity,
      }
      setGuesses([...guesses, newGuess])
      setPlayerGuess("")
    }
  }

  const handleNextRound = () => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length
    const nextCardIndex = Math.floor(Math.random() * gameCards.length)

    setCurrentPlayerIndex(nextPlayerIndex)
    setCurrentCard(gameCards[nextCardIndex])
    setGamePhase("playing")
    setRound(round + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              Round {round}
            </Badge>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm text-gray-600">{players.length} players</span>
            </div>
          </div>
          {gamePhase === "guessing" && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-lg">{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Current Player */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isCurrentPlayer ? "Your Turn!" : `${currentPlayer.name}'s Turn`}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Game Phase: Playing Card */}
        {gamePhase === "playing" && (
          <Card className="text-center">
            <CardContent className="pt-6">
              {isCurrentPlayer ? (
                <div className="space-y-4">
                  <div className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg">
                    <div className="text-sm opacity-80 mb-2">{currentCard.category}</div>
                    <div className="text-3xl font-bold">{currentCard.word}</div>
                  </div>
                  <Button onClick={handlePlayCard} size="lg">
                    Play This Card
                  </Button>
                </div>
              ) : (
                <div className="py-8">
                  <div className="text-lg text-gray-600 mb-4">Waiting for {currentPlayer.name} to play a card...</div>
                  <div className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game Phase: Guessing */}
        {gamePhase === "guessing" && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold mb-2">
                    {isCurrentPlayer ? "Others are guessing your card..." : "What do you think this card is?"}
                  </div>
                  <Progress value={((30 - timeLeft) / 30) * 100} className="w-full" />
                </div>

                {!isCurrentPlayer && (
                  <div className="flex gap-2 max-w-md mx-auto">
                    <Input
                      placeholder="Enter your guess..."
                      value={playerGuess}
                      onChange={(e) => setPlayerGuess(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSubmitGuess()}
                      disabled={guesses.some((g) => g.playerName === playerName)}
                    />
                    <Button
                      onClick={handleSubmitGuess}
                      disabled={!playerGuess.trim() || guesses.some((g) => g.playerName === playerName)}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Guesses */}
            {guesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Guesses So Far ({guesses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {guesses.map((guess, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{guess.playerName}</span>
                        <span className="text-gray-600">Submitted guess</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Game Phase: Results */}
        {gamePhase === "results" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl">Results!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-lg text-gray-600 mb-2">The card was:</div>
                  <div className="text-4xl font-bold text-purple-600">{currentCard.word}</div>
                  <div className="text-sm text-gray-500">({currentCard.category})</div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Player Guesses:</h3>
                  {guesses.length > 0 ? (
                    guesses
                      .sort((a, b) => b.similarity - a.similarity)
                      .map((guess, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{guess.playerName}</span>
                            <span className="text-gray-600 ml-2">guessed "{guess.guess}"</span>
                          </div>
                          <Badge
                            variant={
                              guess.similarity >= 75 ? "default" : guess.similarity >= 50 ? "secondary" : "outline"
                            }
                            className="text-lg px-3 py-1"
                          >
                            {guess.similarity}%
                          </Badge>
                        </div>
                      ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">No guesses were submitted in time!</div>
                  )}
                </div>

                <div className="text-center pt-6">
                  <Button onClick={handleNextRound} size="lg">
                    Next Round
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
