import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import GameLobby from "@/components/game-lobby";
import { createRoomAPI, joinRoomAPI } from "./api/api";

export default function HomePage() {
  const [playerName, setPlayerName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const pin = await createRoomAPI(playerName);
      setGameCode(pin);
      setHasJoined(true);
    } catch (err) {
      setError(err.message || "Failed to create game");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await joinRoomAPI(gameCode, playerName);
      setHasJoined(true);
    } catch (err) {
      setError(err.message || "Failed to join game");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    action: "create" | "join"
  ) => {
    if (e.key === "Enter") {
      if (action === "create") {
        handleCreate();
      } else {
        handleJoin();
      }
    }
  };

  if (hasJoined) {
    return <GameLobby playerName={playerName} gameCode={gameCode} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Card Guessing Game
          </CardTitle>
          <p className="text-gray-600">Choose how you want to play</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Join Game
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Game
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="join" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="joinPlayerName">Your Name</Label>
                <Input
                  id="joinPlayerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "join")}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gameCode">Game Code</Label>
                <Input
                  id="gameCode"
                  placeholder="Enter 6-digit game code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => handleKeyPress(e, "join")}
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleJoin}
                className="w-full"
                disabled={!playerName.trim() || !gameCode.trim() || isLoading}
              >
                {isLoading ? "Joining..." : "Join Game"}
              </Button>
            </TabsContent>

            <TabsContent value="create" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="createPlayerName">Your Name</Label>
                <Input
                  id="createPlayerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "create")}
                  disabled={isLoading}
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  You'll be the host of this game. Other players can join using
                  the game code that will be generated.
                </p>
              </div>
              <Button
                onClick={handleCreate}
                className="w-full"
                disabled={!playerName.trim() || isLoading}
              >
                {isLoading ? "Creating..." : "Create New Game"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
