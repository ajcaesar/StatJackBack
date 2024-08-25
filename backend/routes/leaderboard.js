const express = require('express');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const User = require('../models/User');

const router = express.Router();

// Submit a new score
router.post('/submit', async (req, res) => {
  try {
    const { username, wins, losses } = req.body;
    const entry = new LeaderboardEntry({ username, wins, losses });
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
      .sort({ wins: -1 })
      .limit(100);
    res.json(topScores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top scores', error: error.message });
  }
});

router.get('/topWithRecentScores', async (req, res) => {
    try {
      const topScores = await LeaderboardEntry.find()
        .sort({ wins: -1 })
        .limit(100);
  
      const recentScores = await User.find({ 'recentScore.timestamp': { $exists: true } })
        .sort({ 'recentScore.timestamp': -1 })
        .limit(1)
        .select('username recentScore');
  
      res.json({ topScores, recentScores });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching scores', error: error.message });
    }
  });

  router.get('/handData', async (req, res) => {
    try {
      const { userId } = req.params;
      console.log("id: " + userId);
      const { limit } = req.query;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const handData = user.hands.slice(-limit).reverse();
      res.json(handData);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching hand data', error: error.message });
    }
  });




module.exports = router;