import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TopScores.css';

function TopScores() {
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopScores();
  }, []);

  const fetchTopScores = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/scores/top');
      setTopScores(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch top scores');
      setLoading(false);
    }
  };

  if (loading) return <div className="top-scores-loading">Loading top scores...</div>;
  if (error) return <div className="top-scores-error">{error}</div>;

  return (
    <div className="top-scores-container">
      <h2>Top 10 Players</h2>
      <table className="top-scores-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Wins</th>
          </tr>
        </thead>
        <tbody>
          {topScores.map((score, index) => (
            <tr key={score._id}>
              <td>{index + 1}</td>
              <td>{score.username}</td>
              <td>{score.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopScores;