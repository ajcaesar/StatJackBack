import React, { useState, useEffect } from 'react';
import './App.css';
import Blackjack from './blackjack/components/blackjack';
import SignUp from './blackjack/components/SignUp';
import SignIn from './blackjack/components/SignIn';
import Poker from "./blackjack/components/poker/poker";
import Analytics from "./blackjack/components/analytics/analytics";
import Leaderboard from "./blackjack/components/leaderboard";

function App() {
  const [user, setUser] = useState(null);
  const [showSignIn, setShowSignIn] = useState(true);
  const [isBlackjack, setIsBlackjack] = useState(true);
  const [currentView, setCurrentView] = useState(() => JSON.parse(localStorage.getItem('currentView') || null));

  const handleGameChange = () => {
    setIsBlackjack(!isBlackjack);
  };

  useEffect(() => {
    localStorage.setItem('currentView', JSON.stringify(currentView));
  }, [currentView]);

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
      <>
      <div className="App">
      <h1 id="titlePage">StatJack</h1>
        {showSignIn ? (
          <SignIn onSignIn={handleSignIn} onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUp onSignUp={handleSignUp} onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
        <p>The backend hosted by render can take >1 minute to boot</p>
      </div>
      </>
    );
  }

  if (!currentView) return (
    <div className="App">
        <div className="welcome-screen">
          <h1>Welcome, {user.username}!</h1>
          <div className="button-container1">
            <button onClick={() => setCurrentView('blackjack')}>Play StatJack</button>
            <button onClick={() => setCurrentView('analytics')}>Get Analytics</button>
            <button onClick={() => setCurrentView('leaderboard')}>View Leaderboard</button>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
    </div>
  );

  if (currentView === "blackjack") {
    // console.log(user._id);
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
    {/* <div className="user-info">
        <span>Welcome, {user.username}</span>
        <button id="button-signout" onClick={handleSignOut}>Sign Out</button>
      </div> */}
    <header className="App-header">
    </header>
    {isBlackjack ? <Blackjack setCurrentView={setCurrentView} user={user} /> : <Poker setCurrentView={setCurrentView}/>}
  </div>
  );}

  if (currentView === "analytics") {
    return (
      <div className="App">
        <Analytics setCurrentView={setCurrentView} user={user} />
      </div>
    );
  }

  if (currentView === "leaderboard") {
    return (
      <div className="App">
        <Leaderboard setCurrentView={setCurrentView}/>
      </div>
    );
  }

}
export default App;