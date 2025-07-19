import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Connect once, outside component, to avoid multiple connections on re-render
const socket = io('http://localhost:3000'); // Change to your backend URL if needed

function Game({ pin, playerName }) {
  const [players, setPlayers] = useState([]);
  const [gameStage, setGameStage] = useState('waiting'); // waiting, picking, guessing, showingResult
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [cardOptions, setCardOptions] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [guesses, setGuesses] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Join room and set up listeners
  useEffect(() => {
    socket.emit('joinRoom', { pin, name: playerName });

    socket.on('roomUpdate', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('gameStart', ({ currentPlayer, cards }) => {
      setGameStage('picking');
      setCurrentPlayer(currentPlayer);
      setCardOptions(cards);
      setSelectedCard(null);
      setGuesses({});
    });

    socket.on('startGuessing', ({ selectedBy, timeLimit }) => {
      setGameStage('guessing');
      setCurrentPlayer(selectedBy);
      setTimeLeft(timeLimit);

      // Countdown timer for guessing phase
      const interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    });

    socket.on('showResult', ({ correctAnswer, guesses }) => {
      setGameStage('showingResult');
      setSelectedCard(correctAnswer);
      setGuesses(guesses);
    });

    socket.on('nextTurn', ({ currentPlayer, cards }) => {
      setGameStage('picking');
      setCurrentPlayer(currentPlayer);
      setCardOptions(cards);
      setSelectedCard(null);
      setGuesses({});
    });

    socket.on('errorMsg', (msg) => {
      setErrorMsg(msg);
    });

    // Clean up listeners on unmount
    return () => {
      socket.off('roomUpdate');
      socket.off('gameStart');
      socket.off('startGuessing');
      socket.off('showResult');
      socket.off('nextTurn');
      socket.off('errorMsg');
    };
  }, [pin, playerName]);

  // Start the game (only current player should do this)
  const startGame = () => {
    socket.emit('startGame', pin);
  };

  // Pick a card (only current player can pick)
  const pickCard = (card) => {
    socket.emit('pickCard', { pin, card });
  };

  // Submit a guess (everyone except current player can guess)
  const submitGuess = (guess) => {
    socket.emit('submitGuess', { pin, playerName, guess });
  };

  return (
    <div>
      <h2>Room: {pin}</h2>
      <h3>Players:</h3>
      <ul>
        {players.map(p => (
          <li key={p.name}>
            {p.name} {p.name === currentPlayer ? '(Current Turn)' : ''}
          </li>
        ))}
      </ul>

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      {gameStage === 'waiting' && (
        <>
          <p>Waiting for game to start...</p>
          {players.length > 1 && playerName === currentPlayer && (
            <button onClick={startGame}>Start Game</button>
          )}
        </>
      )}

      {gameStage === 'picking' && currentPlayer === playerName && (
        <>
          <p>Your turn! Pick a card:</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {cardOptions.map((card) => (
              <button
                key={card}
                onClick={() => pickCard(card)}
                disabled={!!selectedCard}
              >
                {card}
              </button>
            ))}
          </div>
        </>
      )}

      {gameStage === 'picking' && currentPlayer !== playerName && (
        <p>Waiting for {currentPlayer} to pick a card...</p>
      )}

      {gameStage === 'guessing' && currentPlayer !== playerName && (
        <>
          <p>{currentPlayer} picked a card. Make your guess! Time left: {timeLeft}s</p>
          <input
            type="text"
            placeholder="Your guess"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitGuess(e.target.value);
                e.target.value = '';
              }
            }}
          />
        </>
      )}

      {gameStage === 'guessing' && currentPlayer === playerName && (
        <p>Others are guessing your card... Time left: {timeLeft}s</p>
      )}

      {gameStage === 'showingResult' && (
        <>
          <p>Correct card: {selectedCard}</p>
          <h4>Guesses:</h4>
          <ul>
            {Object.entries(guesses).map(([player, guess]) => (
              <li key={player}>
                {player}: {guess}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Game;
