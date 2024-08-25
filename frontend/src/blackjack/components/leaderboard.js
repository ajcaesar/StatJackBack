import React, { useState, useEffect } from 'react';
import { getTopScores } from '../../api';
import './Leaderboard.css';

function Leaderboard(props) {
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopScores();
  }, []);

  const fetchTopScores = async () => {
    try {
      setLoading(true);
      const scores = await getTopScores();
      setTopScores(scores);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch top scores');
      setLoading(false);
    }
  };

  if (loading) return <div className="leaderboard-loading">Loading top scores...</div>;
  if (error) return <div className="leaderboard-error">{error}</div>;

  return (
    <div className="leaderboard-container">
    <button id="return-to-main-menu" onClick={() => props.setCurrentView(null)}>return to main menu</button>
      <h2>Top 10 Scores</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {topScores.map((entry, index) => (
            <tr key={entry._id}>
              <td>{index + 1}</td>
              <td>{entry.username}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;