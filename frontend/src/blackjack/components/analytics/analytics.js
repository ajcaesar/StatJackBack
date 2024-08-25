import React, { useState, useEffect } from 'react';
import { fetchHandData } from '../../../api'; // Adjust the import path as needed
import './analytics.css';

function Analytics({ setCurrentView, user }) {
  const [numGames, setNumGames] = useState(5);
  const [handData, setHandData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHandData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHandData(user.id, numGames);
        setHandData(data);
      } catch (err) {
        setError('Failed to fetch hand data');
        console.error(err);
      }
      setLoading(false);
    };

    loadHandData();
  }, [numGames, user.id]);

  const renderHand = (hand) => {
    hand.map((card, index) => (
        <p>{card.value} of {card.suit}</p>
      ));
  }

  return (
    <><button id="return-to-main-menu" className="return" onClick={() => setCurrentView(null)}>return to main menu</button>
    <div className="analytics-container">
      <h2>Game Analytics</h2>
      <div className="input-container">
        <label htmlFor="numGames">Number of recent games to analyze:</label>
        <input
          type="number"
          id="numGames"
          value={numGames}
          onChange={(e) => setNumGames(Math.max(1, parseInt(e.target.value)))}
          min="1"
        />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="hand-data">
          {handData.map((game, index) => (
            <div key={index} className="game-data">
              <h3>Game {index + 1}</h3>
              <p>Player's Hand: {renderHand(game.playerHand)}</p>
              <p>Dealer's Hand: {renderHand(game.dealerHand)}</p>
              <p>Timestamp: {new Date(game.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div></>
  );
}

export default Analytics;