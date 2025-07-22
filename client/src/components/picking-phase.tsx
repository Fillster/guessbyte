import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PickingPhase({
  currentPlayer,
  playerName,
  cards,
  handlePickCard,
}) {
  const isCurrentPlayer = playerName === currentPlayer;

  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        {isCurrentPlayer ? (
          <div className="space-y-4">
            <div className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg">
              <h3 className="text-lg opacity-80 mb-2">Pick a Card</h3>
              <div className="grid grid-cols-2 gap-4">
                {cards.map((card) => (
                  <Button
                    key={card.id}
                    onClick={() => handlePickCard(card)}
                    size="lg"
                    className="bg-white text-gray-800 hover:bg-gray-100 rounded-xl shadow-md transition-all"
                  >
                    {card}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="text-lg text-gray-600 mb-4">
              Waiting for {currentPlayer} to pick a card...
            </div>
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
