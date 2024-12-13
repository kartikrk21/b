import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [gameId, setGameId] = useState(null);
  const [card, setCard] = useState(null);
  const [selectedNumbers, setSelectedNumbers] = useState(new Set());

  useEffect(() => {
    socket.on('gameCreated', ({ gameId, card }) => {
      setGameId(gameId);
      setCard(card);
    });

    socket.on('gameJoined', ({ gameId, card }) => {
      setGameId(gameId);
      setCard(card);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('gameJoined');
    };
  }, []);

  const createGame = () => {
    socket.emit('createGame');
  };

  const joinGame = () => {
    const id = prompt('Enter game ID:');
    if (id) {
      socket.emit('joinGame', id);
    }
  };

  const toggleNumber = (number) => {
    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(number)) {
      newSelected.delete(number);
    } else {
      newSelected.add(number);
    }
    setSelectedNumbers(newSelected);
  };

  return (
    <div className="App">
      <h1>Bingo Game</h1>
      
      {!gameId ? (
        <div className="menu">
          <button onClick={createGame}>Create Game</button>
          <button onClick={joinGame}>Join Game</button>
        </div>
      ) : (
        <div className="game">
          <h2>Game ID: {gameId}</h2>
          {card && (
            <div className="bingo-card">
              {card.map((row, i) => (
                <div key={i} className="row">
                  {row.map((number, j) => (
                    <div
                      key={j}
                      className={`cell ${selectedNumbers.has(number) ? 'selected' : ''}`}
                      onClick={() => toggleNumber(number)}
                    >
                      {number}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App; 