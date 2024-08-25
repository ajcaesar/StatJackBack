const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);