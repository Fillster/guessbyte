import { useEffect, useState } from "react";
import socket from "@/utils/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import GameInterface from "@/components/game-interface";
import testa from "./testa";

interface GameLobbyProps {
  playerName: string;
  gameCode: string;
}

interface Player {
  id: string;
  name: string;
  isReady: boolean;
}

export default function GameLobby({ playerName, gameCode }: GameLobbyProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [hostPlayer, setHostPlayer] = useState("");
  useEffect(() => {
    console.log("playerName: ", playerName);
    console.log("hostname: ", hostPlayer);
    socket.emit("joinRoom", { pin: gameCode, name: playerName });

    socket.emit("getRoomInfo", gameCode, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        setHostPlayer(response.host);
        console.log(response);
        console.log(response.host);
      }
    });

    socket.on("roomUpdate", (playerList) => {
      console.log("player list: ", playerList);
      setPlayers(playerList);
    });

    socket.on("gameStart", () => {
      setGameStarted(true);
    });

    return () => {
      socket.off("roomUpdate");
      socket.off("gameStart");
    };
  }, [gameCode, playerName]);

  useEffect(() => {
    console.log("HOOSOTPLAYER: ", hostPlayer);
  }, [hostPlayer]);

  const testFunc = (gameCode) => {
    socket.emit("getRoomInfo", gameCode, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        console.log(response);
      }
    });
  };

  function startGame() {
    socket.emit("startGame", gameCode);
  }

  if (gameStarted) {
    return (
      <GameInterface
        playerName={playerName}
        gameCode={gameCode}
        players={players}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Game Lobby
          </CardTitle>
          <p className="text-gray-600">
            Game Code: <span className="font-mono font-bold">{gameCode}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold text-lg">Players ({players.length})</h3>
          {players.map((p) => (
            <div
              key={p.id}
              className="flex justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span>{p.name}</span>
              <Badge>{p.isReady ? "Ready" : "Waiting"}</Badge>
            </div>
          ))}
          <p className="text-center text-sm text-gray-500 pt-4">
            Waiting for host to start...
          </p>
          <Button onClick={() => testFunc(gameCode)}>test</Button>
          {playerName === hostPlayer && (
            <Button onClick={startGame}>Start Game</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
