import React, { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPercentage from "./animated-percentage";
import Confetti from "react-dom-confetti";

const ResultsCard = ({
  currentCard,
  rankedGuesses,
  onNextRound,
  isCurrentPlayer,
  playerName, // passed from parent
}) => {
  const topResultRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const toggleChange = () => {
    setShowConfetti(true);
    const timeout = setTimeout(() => setShowConfetti(false), 100);
    return () => clearTimeout(timeout);
  };
  useEffect(() => {
    setShowConfetti(true);
    const timeout = setTimeout(() => setShowConfetti(false), 1000);
    return () => clearTimeout(timeout);
  }, [rankedGuesses, playerName]);

  return (
    <div className="space-y-4 relative">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Results!</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <div className="text-lg text-gray-600 mb-2">The card was:</div>
            <div className="text-4xl font-bold text-purple-600">
              {currentCard}
            </div>
            <div className="text-sm text-gray-500">{currentCard.category}</div>
          </motion.div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Player Guesses:</h3>
            <AnimatePresence>
              {rankedGuesses.length > 0 ? (
                rankedGuesses.map((guess, index) => (
                  <motion.div
                    key={index}
                    ref={index === 0 ? topResultRef : null}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className={`relative flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? "bg-yellow-100" : "bg-gray-50"
                    }`}
                  >
                    {index === 0 && (
                      <div
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10"
                        style={{ pointerEvents: "none" }}
                      >
                        <Confetti
                          active={showConfetti}
                          config={{
                            angle: 90,
                            spread: 90,
                            startVelocity: 30,
                            elementCount: 50,
                            dragFriction: 0.1,
                            duration: 3000,
                            stagger: 3,
                            width: "10px",
                            height: "10px",
                            colors: ["#ff0", "#f0f", "#0ff"],
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <span className="font-medium">{guess.guess}</span>
                    </div>
                    <Badge
                      variant={
                        guess.similarity >= 0.75
                          ? "default"
                          : guess.similarity >= 0.5
                          ? "secondary"
                          : "outline"
                      }
                      className="text-lg px-3 py-1"
                    >
                      <AnimatedPercentage similarity={guess.similarity} />%
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="text-center text-gray-500 py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No guesses were submitted in time!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button onClick={toggleChange}>celebrate</Button>
          {isCurrentPlayer && (
            <motion.div
              className="text-center pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button onClick={onNextRound} size="lg">
                Next Round
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsCard;
