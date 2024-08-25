import React, { useState, useEffect } from 'react';
import { getTopAndRecentScores } from '../../api';
import './Leaderboard.css';

function Leaderboard(props) {
  const [topScores, setTopScores] = useState([]);
  const [recentScores, setRecentScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const { topScores, recentScores } = await getTopAndRecentScores();
      setTopScores(topScores);
      setRecentScores(recentScores);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch scores');
      setLoading(false);
    }
  };

  if (loading) return <div className="leaderboard-loading">Loading scores...</div>;
  if (error) return <div className="leaderboard-error">{error}</div>;

  return (
    <><button id="return-to-main-menu" className="return" onClick={() => props.setCurrentView(null)}>return to main menu</button>
    <div className="leaderboard-container">
      <h2>Top 100 Player Scores</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Wins</th>
            <th>Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {topScores.map((entry, index) => (
            <tr key={entry._id}>
              <td>{index + 1}</td>
              <td>{entry.username}</td>
              <td>{entry.wins}</td>
              <td>{((entry.wins / (entry.wins + entry.losses)) * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="recent-scores">Your Most Recent Submission</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {recentScores.map((entry) => (
            <tr key={entry._id}>
              <td>{entry.username}</td>
              <td>{entry.recentScore.wins}</td>
              <td>{entry.recentScore.losses}</td>
              <td>{new Date(entry.recentScore.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

export default Leaderboard;