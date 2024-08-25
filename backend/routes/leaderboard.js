const express = require('express');
const LeaderboardEntry = require('../models/LeaderboardEntry');

const router = express.Router();

// Submit a new score
router.post('/submit', async (req, res) => {
  try {
    const { username, score } = req.body;
    const entry = new LeaderboardEntry({ username, score });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting score', error: error.message });
  }
});

// Get top 10 scores
router.get('/top', async (req, res) => {
  try {
    const topScores = await LeaderboardEntry.find()
      .sort({ score: -1 })
      .limit(10);
    res.json(topScores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top scores', error: error.message });
  }
});

module.exports = router;