import React, { useState, useEffect } from 'react';
import { fetchHandData } from '../../../api'; // Adjust the import path as needed
import './analytics.css';
import Card from "../card"

function Analytics({ setCurrentView, user }) {
  const [numGames, setNumGames] = useState(5);
  const [handData, setHandData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordByHand, setRecordByHand] = useState(Array(21).fill().map(() => ({ wins: 0, losses: 0 })));
  const [totalRecord, setTotalRecord] = useState({wins: 0, losses: 0});

  useEffect(() => {
    let data1;
    const loadHandData = async () => {
      
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHandData(user.id, numGames);
        setHandData(data);
        data1 = data;
      } catch (err) {
        setError('Failed to fetch hand data in analytics');
        console.error(err);
      }
      setLoading(false);
    };

    loadHandData();
  }, [numGames, user.id]);

  useEffect(() => {
    updateRecord();
  }, [handData]);

  const updateRecord = () => {
    let currRecord = Array(21).fill().map(() => ({ wins: 0, losses: 0 }));
    let thisCurrRecord = {wins: 0, losses: 0}
    
    for (let game of handData) {
        if (checkWinner(game.playerHand, game.dealerHand) === 'player') {
            thisCurrRecord.wins++;
            currRecord[initialHandVal(game.playerHand) - 1].wins++;
        }
        else if (checkWinner(game.playerHand, game.dealerHand) === 'dealer') {
            thisCurrRecord.losses++;
            currRecord[initialHandVal(game.playerHand) - 1].losses++;
        }
    }
    setRecordByHand(currRecord);
    setTotalRecord(thisCurrRecord);
  }

  const RenderHand = ({ hand }) => {
    // Check if the hand array has at least one card and log the suit of the first card
  
    return (
      <div>
        {hand.map((card, index) => (
          <Card key={index} side={"front"} suit={card.suit} value={card.value} />
        ))}
      </div>
    );
  };

  const RenderRecord = ({ record }) => {
    return (
      <div className="table-container-record">
        <table>
          <thead>
            <tr>
              <th>Starting Hand</th>
              <th>Wins</th>
              <th>Losses</th>
            </tr>
          </thead>
          <tbody>
            {record
              .map((row, index) => ({ ...row, originalIndex: index }))
              .filter(row => row.wins !== 0 || row.losses !== 0)
              .map(row => (
                <tr key={row.originalIndex}>
                  <td>{row.originalIndex + 1}</td>
                  <td>{row.wins}</td>
                  <td>{row.losses}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };
  

function checkWinner(playerHand, dealerHand) {
    const playerSum = sumValue(playerHand);
    const dealerSum = sumValue(dealerHand);
    if (playerSum === 21) return 'player';
    if (playerSum > 21) return 'dealer';
    if (dealerSum > 21) return 'player';
    if (playerSum > dealerSum) return 'player';
    if (playerSum < dealerSum) return 'dealer';
    return 'push';
  }

  // calculates the players initial hand
  const initialHandVal = (hand) => {
    return sumValue(hand.slice(0, 2));
  }

  const sumValue = (hand) => {
    const vals = {
      "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
      "10": 10, "jack": 10, "queen": 10, "king": 10, "ace": 11
    };
    let sum = 0;
    let aceCount = 0;
    for (let card of hand) {
      if (card.value === 'ace') aceCount++;
      sum += vals[card.value];
    }
    // If it's the initial deal (2 cards) and there's an ace, keep it as 11 unless it causes a bust
    if (hand.length === 2 && aceCount > 0 && sum <= 21) {
      return sum;
    }
    // Otherwise, adjust aces as needed
    while (sum > 21 && aceCount > 0) {
      sum -= 10;
      aceCount--;
    }
    return sum;
  };


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
        <div>
            <h2 className="total-record">Record: {totalRecord.wins} wins and {totalRecord.losses} losses</h2>
            <div id="render-record">
            <RenderRecord record={recordByHand}/>
            </div>
            <h2 className="total-record">Game Log:</h2>
        </div>

      )}

      {!loading && !error && (
        <div className="hand-data">
          {handData.map((game, index) => (
            <div key={index} className="game-data">
              <h3>Game {index + 1}</h3>
              <div><p>Player's Score: {sumValue(game.playerHand) <= 21 ? sumValue(game.playerHand) : "Busted"}</p><RenderHand hand={game.playerHand}/></div>
              <div><p>Dealer's Score: {sumValue(game.dealerHand) <= 21 ? sumValue(game.dealerHand) : "Busted"}</p><RenderHand hand={game.dealerHand}/></div>
              <p>Timestamp: {new Date(game.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div></>
  );
}

export default Analytics;