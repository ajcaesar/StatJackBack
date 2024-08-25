const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error signing up', error: error.message });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Error signing in', error: error.message });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Not authorized', error: error.message });
  }
});

router.put('/stats', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(decoded.userId, req.body, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stats', error: error.message });
  }
});

router.get('/scores/top', async (req, res) => {
    try {
      const topScores = await User.find({})
        .sort({ wins: -1 })
        .limit(10)
        .select('username wins -_id');
      res.json(topScores);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching top scores', error: error.message });
    }
  });

  router.put('/updateRecentScore', async (req, res) => {
    try {
      const { userId, wins, losses } = req.body;
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          recentScore: { 
            wins, 
            losses, 
            timestamp: new Date() 
          } 
        },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'Recent score updated successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Error updating recent score', error: error.message });
    }
  });

  router.post('/saveHand', async (req, res) => {
    try {
      const { userId, playerHand, dealerHand, deck } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.hands.push({ playerHand, dealerHand, deck });
      await user.save();
      res.json({ message: 'Hand saved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error saving hand', error: error.message });
    }
  });

  router.get('/handData/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log("id: " + userId);
    const { limit } = req.query;
    console.log("limit: " + limit);
    
    try {
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