const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  username: { type: String, required: true },
  wins: { type: Number, required: true },
  losses: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

leaderboardEntrySchema.virtual('winRate').get(function() {
  const totalGames = this.wins + this.losses;
  return totalGames > 0 ? (this.wins / totalGames * 100).toFixed(2) : '0.00';
});

leaderboardEntrySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);