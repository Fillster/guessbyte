"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import GameInterface from "@/components/game-interface"

interface GameLobbyProps {
  playerName: string
  gameCode: string
}

export default function GameLobby({ playerName, gameCode }: GameLobbyProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState([
    { id: 1, name: playerName, isReady: true },
    { id: 2, name: "Alice", isReady: true },
    { id: 3, name: "Bob", isReady: false },
    { id: 4, name: "Charlie", isReady: true },
  ])

  // Auto-start game after 3 seconds for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameStarted(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (gameStarted) {
    return <GameInterface playerName={playerName} players={players} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Game Lobby</CardTitle>
          <p className="text-gray-600">
            Game Code: <span className="font-mono font-bold">{gameCode}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Players ({players.length}/4)</h3>
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{player.name}</span>
                <Badge variant={player.isReady ? "default" : "secondary"}>
                  {player.isReady ? "Ready" : "Not Ready"}
                </Badge>
              </div>
            ))}
          </div>
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 mb-2">Starting game...</p>
            <div className="animate-pulse">
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
