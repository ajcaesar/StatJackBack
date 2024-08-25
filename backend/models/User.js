const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const handSchema = new mongoose.Schema({
  playerHand: [{ suit: String, value: String }],
  dealerHand: [{ suit: String, value: String }],
  deck: [{ suit: String, value: String }],
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  recentScore: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    timestamp: { type: Date }
  },
  hands:[handSchema]
});



userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);