import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import GameLobby from "@/components/game-lobby"
import { createRoomAPI, joinRoomAPI } from "./api/api"


export default function HomePage() {
  const [playerName, setPlayerName] = useState("")
  const [gameCode, setGameCode] = useState("")
  const [hasJoined, setHasJoined] = useState(false)


const handleCreate = async () => {
  try {
    const pin = await createRoomAPI(playerName);
    setGameCode(pin);
    setHasJoined(true);
  } catch (err) {
    alert(err.message);
  }
};


  const handleJoin = async () => {
  try {
    await joinRoomAPI(gameCode, playerName);
    setHasJoined(true);
  } catch (err) {
    alert(err.message);
  }
};

  if (hasJoined) {
    return <GameLobby playerName={playerName} gameCode={gameCode} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Card Guessing Game</CardTitle>
          <p className="text-gray-600">Enter your details to join the game</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gameCode">Game Code</Label>
            <Input
              id="gameCode"
              placeholder="Enter game code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>
          <Button onClick={handleJoin} className="w-full" disabled={!playerName.trim() || !gameCode.trim()}>
            Join Game
          </Button>
           <Button onClick={handleCreate}>Create</Button>
        </CardContent>
      </Card>
    </div>
  )
}
