import React, { useState, useEffect } from 'react';
import './App.css';
import Blackjack from './blackjack/blackjack';
import SignUp from './blackjack/components/SignUp';
import SignIn from './blackjack/components/SignIn';
import { getProfile } from './api';
import Poker from "./poker/poker";

function App() {
  const [user, setUser] = useState(null);
  const [showSignIn, setShowSignIn] = useState(true);
  const [isBlackjack, setIsBlackjack] = useState(true);

  const handleGameChange = () => {
    setIsBlackjack(!isBlackjack);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSignIn = (userData) => {
    setUser(userData);
  };

  const handleSignUp = (userData) => {
    setUser(userData);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  if (!user) {
    return (
      <div className="App">
      <h1 id="titlePage">StatJack</h1>
        {showSignIn ? (
          <SignIn onSignIn={handleSignIn} onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUp onSignUp={handleSignUp} onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <div className="game-switch">
      <span className={`game-label1 ${isBlackjack ? 'active' : ''}`}>StatJack</span>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={!isBlackjack} 
          onChange={handleGameChange}
        />
        <span className="slider round"></span>
      </label>
      <span className={`game-label1 ${!isBlackjack ? 'active' : ''}`}>Poker Calculator</span>
    </div>
    <div className="user-info">
        <span>Welcome, {user.username}</span>
        <button id="button-signout" onClick={handleSignOut}>Sign Out</button>
      </div>
    <header className="App-header">
    </header>
    {isBlackjack ? <Blackjack /> : <Poker />}
  </div>
  );
}

export default App;