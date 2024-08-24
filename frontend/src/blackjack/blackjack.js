
import React, { useState, useEffect } from 'react';
import Card from './components/card';
import calculateDealerOdds from './calculations/bjStats';
import OddsList from './components/oddsList';
import calculatePlayerOdds from './calculations/playerStats';
import HitOddsList from './components/hitOdds';

function Blackjack() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState('playerMove');
  const [numDecks, setNumDecks] = useState(1);
  const [resetDeckMode, setResetDeckMode] = useState(true);
  const [showOdds, setShowOdds] = useState(false);
  const [dealerOdds, setDealerOdds] = useState([]);
  const [numBustsShown, setNumBustsShown] = useState(0);
  const [bustOdds, setBustOdds] = useState([]);
  const [wins, setWins] = useState(() => parseInt(localStorage.getItem('wins')) || 0);
  const [losses, setLosses] = useState(() => parseInt(localStorage.getItem('losses')) || 0);
  const [winner, setWinner] = useState('neither');
  const [hitOddsVisibility, setHitOddsVisibility] = useState({});
  const [quizMode, setQuizMode] = useState(false);
  const [correctGuess, setCorrectGuess] = useState(() => parseInt(localStorage.getItem('correctGuess')) || 0);
  const [wrongGuess, setWrongGuess] = useState(() => parseInt(localStorage.getItem('wrongGuess')) || 0);
  const [playerGuess, setPlayerGuess] = useState(false);
  const [isCorrectGuess, setIsCorrectGuess] = useState("NA")

  

  const toggleHitOddsList = (index) => {
      setHitOddsVisibility(prevVisibility => ({
        ...prevVisibility,
        [index]: !prevVisibility[index] // Toggle visibility
      }));
  };

  const initializeDeck = (override=false) => {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
      let newDeck = [];
  
      if (resetDeckMode || deck.length <= 10 || override) {
        for(let i = 0; i < numDecks; i++) {
          newDeck = [...newDeck, ...suits.flatMap(suit => values.map(value => ({ side: 'front', suit, value })))];
        }
        setDeck(shuffleDeck(newDeck));
      } else {
        // keep the existing deck
        setDeck(deck);
      }

  };
  
  useEffect(() => {
    localStorage.setItem('wins', wins);
  }, [wins]);

  useEffect(() => {
    localStorage.setItem('correctGuess', correctGuess);
  }, [correctGuess]);

  useEffect(() => {
    localStorage.setItem('wrongGuess', wrongGuess);
  }, [wrongGuess]);
  
  useEffect(() => {
    localStorage.setItem('losses', losses);
  }, [losses]);

  useEffect(() => {
    if(dealerHand[0] && deck) {
    setDealerOdds(calculateDealerOdds([dealerHand[0]], deck));
  }}, [deck]);
  
  useEffect(() => {
    initializeDeck();
  }, [numDecks]);      

  useEffect(() => {
    if (sumValue(playerHand) >= 21) {
      setWinner(checkWinner());
      setGameStatus('over');
    }
  }, [playerHand]);

  useEffect(() => {
    const initGame = async () => {
      initializeGame();
    };
    initGame();
  }, []);

  const shuffleDeck = (deck) => {
    return deck.sort(() => Math.random() - 0.5);
  };

  const dealCard = () => {
    return new Promise(resolve => {
      setDeck(prevDeck => {
        const newDeck = [...prevDeck];
        const card = newDeck.pop();
        resolve(card);
        return newDeck;
      });
    });
  };

  const initializeGame = async (override=false) => {
    // console.log('or: ' + override);
    setGameStatus('idle');
    initializeDeck(override);
    const card1 = await dealCard();
    const card2 = await dealCard();
    const card3 = await dealCard();
    setPlayerHand([card1, card2]);
    setDealerHand([card3]);
    setGameStatus('playerMove');
    setShowOdds(false);
    setNumBustsShown(0);
    setBustOdds([]);
    setPlayerGuess(false);
    setIsCorrectGuess("NA")
  };

  const resetWins = () => {
    setWins(0);
    setLosses(0);
  }

  const getTextColor = (value) => {
    if (value === 'player') return 'green';
    return 'red'
  };

  const resetProbs = () => {
    setNumBustsShown(0);
    setBustOdds([]);
  }

  // given a players score, what is the chance that they beat the dealer?
  function probOfStay(dealerArr, playerScore) {
    if (playerScore === 21) {
      let win = 1;
      let tie = 0; 
      let lose = 0;
      return {win, tie, lose};
    }
    if (playerScore > 21) {
      let win = 0;
      let tie = 0; 
      let lose = 1;
      return {win, tie, lose};
    }

    let win = 0
    win += dealerArr[dealerArr.length - 1]; //chance of dealer busting 
    let tie = 0;
    let lose = 0;
    for(let i=0; i+17 < playerScore; i++) {
      win += dealerArr[i]; //chance the dealer scores less than the player
    }
    for (let z=4; z + 17 > playerScore && z >= 0; z--)   {
      lose += dealerArr[z];
    }
    if (playerScore-17 >= 0 ) { 
      tie += dealerArr[playerScore - 17];
    }
    return {win, tie, lose};
  }

  // probability that the player beats the dealer if they hit again
  function probOfHit(dealerArr, playerArr) {
    // console.log("playerArr: " + playerArr);
    let winOdds = 0
    winOdds += playerArr[playerArr.length - 2]; // chance of the player getting BlackJack // + dealerArr[dealerArr.length - 1] * (1-playerArr[playerArr.length - 1]);
    let tieOdds = 0;
    let loseOdds = 0;
    loseOdds += playerArr[playerArr.length - 1]; // chance of the player busting
    for(let i = 0; i < playerArr.length - 2; i++) {
      if (playerArr[i] > 0) {
      let {win, tie, lose} = probOfStay(dealerArr, i+1);
      winOdds += playerArr[i] * win; // probability of player getting this sum * probability of them winning if they get this sum
      tieOdds += playerArr[i] * tie; 
      loseOdds += playerArr[i] * lose;
    }}
    // console.log("winOdds: " + winOdds);
    // console.log("loseOdds: " + loseOdds);
    // console.log("tieOdds: " + tieOdds);
    return {winOdds, tieOdds, loseOdds};
  }

  function OddsCalc({dealerArr, playerArr}) {
    let {winOdds, tieOdds, loseOdds} = probOfHit(dealerArr, playerArr);
    return(<div className="odds-container"><p className="odds-item odds-win">win: {(winOdds*100).toFixed(0)}%</p>
    <p className="odds-item odds-tie">tie: {(tieOdds*100).toFixed(0)}%</p>
    <p className="odds-item odds-lose">lose: {(loseOdds*100).toFixed(0)}%</p></div>)}

  function InitialOddsCalc({dealerArr, playerScore}) {
    let {win, tie, lose} = probOfStay(dealerArr, playerScore);
    return(<div className="odds-container"><p className="odds-item odds-win">win: {(win*100).toFixed(0)}%</p>
    <p className="odds-item odds-tie">tie: {(tie*100).toFixed(0)}%</p>
    <p className="odds-item odds-lose">lose: {(lose*100).toFixed(0)}%</p></div>);
  }
  
  // const hit = async () => {
  //   const newCard = await dealCard();
  //   let uHand;
  //   await setPlayerHand(prevHand => {
  //     const updatedHand = [...prevHand, newCard];
  //     uHand = updatedHand;
  //     // Recalculate dealer odds if needed
  //     // const updatedDealerOdds = calculateDealerOdds([dealerHand[0]], deck);
  //     // setDealerOdds(updatedDealerOdds);
  //     setBustOdds(fillOdds(updatedHand));
  //   });
  //   return uHand;
  // };
  const hit = async () => {
    const newCard = await dealCard();
    return new Promise(resolve => {
      setPlayerHand(prevHand => {
        const updatedHand = [...prevHand, newCard];
        setBustOdds(fillOdds(updatedHand));  // Update bust odds if needed
        resolve(updatedHand);  // Resolve with the updated hand
        setPlayerGuess(false);
        setIsCorrectGuess("NA")
        return updatedHand;
      });
    });
  };
  

  const doubleDown = async () => {
    let pHand = await hit();
    // console.log(pHand.length);
    let r = stand(pHand, 2);
  }

  const surrender = () => {
    setLosses(losses + .5);
    setWinner('dealer');
    setGameStatus('over');
  }



  useEffect(() => {
    if (gameStatus === 'playerMove' && playerHand.length > 0) {
      setBustOdds(fillOdds(playerHand));
    }
  }, [playerHand]);
  

  const fillOdds = (updatedHand) => { 
    let arr = [];
    for (let i = 1; i <= numBustsShown; i++) {
      arr.push(calculatePlayerOdds(updatedHand, deck, i));
    }
    return arr;
  };

  const dealerHit = async () => {
    let currentHand = [...dealerHand];
    while (sumValue(currentHand) < 17) {
      const newCard = await dealCard();
      currentHand.push(newCard);
    }
    await setDealerHand(currentHand);
    return currentHand;
  };

  const sumValue = (hand) => {
    const vals = {
      "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
      "10": 10, "jack": 10, "queen": 10, "king": 10, "ace": 11
    };
    let sum = 0;
    let aceCount = 0;
    for (let card of hand) {
      if (card.value === 'ace') aceCount++;
      sum += vals[card.value];
    }
    // If it's the initial deal (2 cards) and there's an ace, keep it as 11 unless it causes a bust
    if (hand.length === 2 && aceCount > 0 && sum <= 21) {
      return sum;
    }
    // Otherwise, adjust aces as needed
    while (sum > 21 && aceCount > 0) {
      sum -= 10;
      aceCount--;
    }
    return sum;
  };

  const updateProbs = async () => {
    const odds = calculatePlayerOdds(playerHand, deck, numBustsShown + 1);
    setBustOdds(prev => [...prev, odds]);
    setNumBustsShown(prev => prev + 1);
};

  const checkPlayerBust = () => {
    return sumValue(playerHand) > 21;
  }

  const checkDealerBust = () => {
    return sumValue(dealerHand) > 21;
  }

  const checkBust = (dlr) => {
    return (sumValue(dlr) > 21);
  }

  const checkWinner = (dlr=null, pHand=null, weight=1) => {
    if (dlr && pHand) {
      if (checkBust(pHand)) {
        setLosses(losses + weight);
        return 'dealer';
      }
      if (checkBust(dlr)) {
        setWins(wins + weight);
        return 'player';
      }
      if (sumValue(pHand) > sumValue(dlr)) {
        setWins(wins + weight);
        return 'player';
      }
      if (sumValue(pHand) < sumValue(dlr)) {
        setLosses(losses + weight);
        return 'dealer';
      }
      return 'tie';
    }
    if (dlr) {
      if (checkPlayerBust()) {
        setLosses(losses + weight);
        return 'dealer';
      }
      if (checkBust(dlr)) {
        setWins(wins + weight);
        return 'player';
      }
      if (sumValue(playerHand) > sumValue(dlr)) {
        setWins(wins + weight);
        return 'player';
      }
      if (sumValue(playerHand) < sumValue(dlr)) {
        setLosses(losses + weight);
        return 'dealer';
      }
      return 'tie';
    }
    if (pHand) {
      if (checkBust(pHand)) {
        setLosses(losses + weight);
        return 'dealer';
      }
      if (checkBust(dealerHand)) {
        setWins(wins + weight);
        return 'player';
      }
      if (sumValue(pHand) > sumValue(dealerHand)) {
        setWins(wins + weight);
        return 'player';
      }
      if (sumValue(pHand) < sumValue(dealerHand)) {
        setLosses(losses + weight);
        return 'dealer';
      }
      return 'tie';

    }
    if (checkPlayerBust()) {
      setLosses(losses + weight);
      return 'dealer';
    }
    if (checkDealerBust()) {
      setWins(wins + weight);
      return 'player';
    }
    if (sumValue(playerHand) > sumValue(dealerHand)) {
      setWins(wins + weight);
      return 'player';
    }
    if (sumValue(playerHand) < sumValue(dealerHand)) {
      setLosses(losses + weight);
      return 'dealer';
    }
    return 'tie';
  };
  
  const stand = async (pHand=null, weight=1) => {
    const dlr = await dealerHit();
    const gameResult = checkWinner(dlr, pHand, weight);
    setWinner(gameResult);
    setGameStatus('over');
    return gameResult;
  };
  

  function capitalizeFirstLetter(str) {
    if (!str) return ''; // Return an empty string if input is empty
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const handleNumDecksChange = async (event) => {
    const value = parseInt(event.target.value, 10);
    if (value >= 1 && value <= 10) {
      await setNumDecks(value);
    }
    initializeGame();
    resetDeckBtn();
  };

  const resetDeckModeChange = (event) => {
    setResetDeckMode(!resetDeckMode);
    initializeGame();
  }

  const dealerOddsBtn = () => {
    setShowOdds(!showOdds);
    const odds = calculateDealerOdds([dealerHand[0]], deck);
    setDealerOdds(odds);
  };

  const resetDeckBtn = () => {
    initializeGame(true);
  }

  const checkGuess = (value, ev) => {
    if (value) {

    }
  }

  const updateGuess = (event) => {
    setPlayerGuess(true);
    let currId = event.target.id;
    let {win, tie, lose} = probOfStay(calculateDealerOdds([dealerHand[0]], deck), sumValue(playerHand));
    let playOdds = calculatePlayerOdds(playerHand, deck, 1);
    // console.log(playOdds);
    let {winOdds, tieOdds, loseOdds} = probOfHit(calculateDealerOdds([dealerHand[0]], deck), playOdds);
    
    // console.log("win: " + win)
    // console.log("win1: " + winOdds)
    
    if (currId ==="hitGuessBtn") {
      if (winOdds > win) {
        setIsCorrectGuess("Correct")
        setCorrectGuess(correctGuess + 1);
      }
      else if (winOdds === win) {
        setIsCorrectGuess("Equal")
      }
      else {
        setIsCorrectGuess("Incorrect")
        setWrongGuess(wrongGuess + 1);
      }

    }
    else if (currId ==="standGuessBtn") {
      if (win > winOdds) {
        setIsCorrectGuess("Correct")
        setCorrectGuess(correctGuess + 1);
      }
      else if (win === winOdds) {
        setIsCorrectGuess("Equal")
      }
      else {
        setIsCorrectGuess("Incorrect")
        setWrongGuess(wrongGuess + 1);
      }
    }

  }

  const resetGuessScores = () => {
    setCorrectGuess(0);
    setWrongGuess(0);
  }
  
  const resetQuizMode = () => {
    setQuizMode(prevQuizMode => !prevQuizMode);
    initializeGame();
  }

  return (
    <div className="blackjack-game">
      <h1 id="titlePage">StatJack</h1>
      <button id="quizMode" onClick={resetQuizMode}>
  Quiz Mode: {quizMode ? "On" : "Off"} 
</button>
      
      <div className="game-settings">
        <div className="deck-selector">
          <label htmlFor="numDecks">Number of decks:</label>
          <input 
            id="numDecks" 
            type="number" 
            name="numDecks" 
            min="1" 
            max="10" 
            value={numDecks}
            onChange={handleNumDecksChange}
          />
        </div>
        <div className="reset-selector">
          <input 
            id="resetDeckMode" 
            type="checkbox" 
            name="resetDeckMode" 
            checked={resetDeckMode}
            onChange={resetDeckModeChange}
          />
          <label htmlFor="resetDeckMode">Reset Deck each game</label>
        </div>
        {!resetDeckMode && 
        <div className="reset-deck-button">
            <p id="numCards">{gameStatus==='playerMove' ? deck.length-1 : deck.length} cards left in deck</p>
            <button id="reset-deck-btn" onClick={resetDeckBtn}>Reset Deck</button>
        </div>
        }
      </div>
      <div className='wins-counter'><p className='wins'>wins: {wins}</p>
      <p className='losses'>losses: {losses}</p><button onClick={resetWins}>reset score</button></div>
      
  
      {gameStatus === 'idle' && (
        <button onClick={() => initializeGame()}>Start Game</button>
      )}
  
      {(gameStatus === 'playerMove' || gameStatus === 'over') && (
        <div className="game-area">
          <div className="hand player-hand">
            <h2>Player Score: {sumValue(playerHand)}</h2>
            <div className="cards">
              {playerHand.map((card, index) => (
                <Card key={index} side={card.side} suit={card.suit} value={card.value} />
              ))}
            </div>
            {/* <p>Player Score: {sumValue(playerHand)}</p> */}
            <div id="nonetype">
            {!quizMode && (
            <div id="moves1">
            {gameStatus === 'playerMove' && dealerHand.length > 0 && (
              <div id="curr-odds-container">
                <span id="curr-odds">Current Odds: </span><InitialOddsCalc key={1} dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerScore={sumValue(playerHand)} />
              </div>
            )}
            {gameStatus ==='playerMove' && (<><button className="numBustsBtn" onClick={updateProbs}>show odds after {numBustsShown + 1} hit{numBustsShown > 0 ? 's' : ''}</button>
            {numBustsShown > 0 && (<button className="numBustsBtn" onClick={resetProbs}>clear</button>)}
            {/* {bustOdds.map((bust, index) => <div id='numBusts' key={index}><>{index + 1} hit{index > 0 ? 's' : ''}: </>
            <OddsCalc key={index + 50} dealerArr={dealerOdds} playerArr={bust}/>
            <HitOddsList  key={index} arr={bust}/>
            </div>)} */}

            {bustOdds.map((bust, index) => (
                <div id='numBusts' key={index}>
                  <span className="future-odds">Odds After {index + 1} hit{index > 0 ? 's' : ''}:</span>
                  <OddsCalc key={index + 50} dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerArr={bust} />
                  <button id="check-btn" onClick={() => toggleHitOddsList(index)}>
                    {hitOddsVisibility[index] ? 'Hide' : 'Details'}
                  </button>
                  <div style={{ display: hitOddsVisibility[index] ? 'block' : 'none' }}>
                    <HitOddsList key={index} arr={bust} />
                  </div>
                </div>
              ))}
            </>)}
          </div>)}

          {quizMode && (
            <div className="quiz-mode-container">
              <h2>Quiz Mode:</h2>
              <div id="guessesBox">Guesses: <span className="correct">Correct: {correctGuess}</span><span className="incorrect">Incorrect: {wrongGuess}</span>
              <button id="resetGuessScoreBtn" onClick={resetGuessScores}>reset</button></div>
              {gameStatus ==='playerMove' && (
              <>
              {!playerGuess && (<>
              <p className="oddsBetter">Is the probability of you winning higher if you: </p>
              <button id="hitGuessBtn" className ="guess-btn" onClick={updateGuess}>Hit?</button>
              <span> or </span>
              <button id="standGuessBtn" className="guess-btn" onClick={updateGuess}>Stand?</button>
              </>)}
            
              {playerGuess && (<>
              <div id="guessNameDiv" className={isCorrectGuess.toLowerCase()}>{isCorrectGuess}</div>
              <span id="curr-odds">Current Odds: </span><InitialOddsCalc dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerScore={sumValue(playerHand)} />
              {gameStatus ==='playerMove' && (<><button className="numBustsBtn" onClick={updateProbs}>show odds after {numBustsShown + 1} hit{numBustsShown > 0 ? 's' : ''}</button>
            {numBustsShown > 0 && (<button className="numBustsBtn" onClick={resetProbs}>clear</button>)}
            {/* {bustOdds.map((bust, index) => <div id='numBusts' key={index}><>{index + 1} hit{index > 0 ? 's' : ''}: </>
            <OddsCalc key={index + 50} dealerArr={dealerOdds} playerArr={bust}/>
            <HitOddsList  key={index} arr={bust}/>
            </div>)} */}

            {bustOdds.map((bust, index) => (
                <div id='numBusts' key={index}>
                  <span className="future-odds">Odds After {index + 1} hit{index > 0 ? 's' : ''}:</span>
                  <OddsCalc key={index + 50} dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerArr={bust} />
                  <button id="check-btn" onClick={() => toggleHitOddsList(index)}>
                    {hitOddsVisibility[index] ? 'Hide' : 'Details'}
                  </button>
                  <div style={{ display: hitOddsVisibility[index] ? 'block' : 'none' }}>
                    <HitOddsList className="darkgrayodds" key={index} arr={bust} />
                  </div>
                </div>
              ))}
            </>)}
              {/* <span>Odds if Hit: </span><OddsCalc dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerArr={calculatePlayerOdds(playerHand, deck, 1)} />
              <HitOddsList arr={calculatePlayerOdds(playerHand, deck, 1)} /> */}
              </>
              )}</>)}
              </div>
              
          )}

      </div>
          </div>
          <div className="hand dealer-hand">
            <h2 id="dScore">Dealer Score: {gameStatus === 'over' ? sumValue(dealerHand) : '?'}</h2>
            <div className="cards">
              {dealerHand.map((card, index) => (
                <Card key={index} side={card.side} suit={card.suit} value={card.value} />
              ))}
              {dealerHand.length === 1 && <Card key={1} side={'back'} suit={null} value={null} />}
            </div>
            {/* <p>Dealer Score: {gameStatus === 'over' ? sumValue(dealerHand) : '?'}</p> */}
          </div>

          {!quizMode && (
            <div id="moves2">
            {gameStatus === 'playerMove' && dealerHand.length > 0 && (
              <div id="curr-odds-container">
                <span id="curr-odds">Current Odds: </span><InitialOddsCalc key={1} dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerScore={sumValue(playerHand)} />
              </div>
            )}
            {gameStatus ==='playerMove' && (<><button className="numBustsBtn" onClick={updateProbs}>show odds after {numBustsShown + 1} hit{numBustsShown > 0 ? 's' : ''}</button>
            {numBustsShown > 0 && (<button className="numBustsBtn" onClick={resetProbs}>clear</button>)}
            {/* {bustOdds.map((bust, index) => <div id='numBusts' key={index}><>{index + 1} hit{index > 0 ? 's' : ''}: </>
            <OddsCalc key={index + 50} dealerArr={dealerOdds} playerArr={bust}/>
            <HitOddsList  key={index} arr={bust}/>
            </div>)} */}

            {bustOdds.map((bust, index) => (
                <div id='numBusts' key={index}>
                  <span className="future-odds">Odds After {index + 1} hit{index > 0 ? 's' : ''}:</span>
                  <OddsCalc key={index + 50} dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerArr={bust} />
                  <button id="check-btn" onClick={() => toggleHitOddsList(index)}>
                    {hitOddsVisibility[index] ? 'Hide' : 'Details'}
                  </button>
                  <div style={{ display: hitOddsVisibility[index] ? 'block' : 'none' }}>
                    <HitOddsList key={index} arr={bust} />
                  </div>
                </div>
              ))}
            </>)}
          </div>)}

          {quizMode && (
            <div className="quiz-mode-container">
              <h2>Quiz Mode:</h2>
              <div>Guesses: <span className="correct">Correct: {correctGuess}</span><span className="incorrect">Incorrect: {wrongGuess}</span>
              <button id="resetGuessScoreBtn" onClick={resetGuessScores}>reset</button></div>
              {gameStatus ==='playerMove' && (
              <>
              {!playerGuess && (<>
              <p className="oddsBetter">Is your probability of winning higher if you: </p>
              <button id="hitGuessBtn" className ="guess-btn" onClick={updateGuess}>Hit{playerHand.length > 2 ? " Again":""}?</button>
              <span> or </span>
              <button id="standGuessBtn" className="guess-btn" onClick={updateGuess}>Stand?</button>
              </>)}
            
              {playerGuess && (<>
              <div id="guessBox1" className={isCorrectGuess.toLowerCase()}>{isCorrectGuess}</div>
              <span id="curr-odds">Current Odds: </span><InitialOddsCalc dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerScore={sumValue(playerHand)} />
              {gameStatus ==='playerMove' && (<><button className="numBustsBtn" onClick={updateProbs}>show odds after {numBustsShown + 1} hit{numBustsShown > 0 ? 's' : ''}</button>
            {numBustsShown > 0 && (<button className="numBustsBtn" onClick={resetProbs}>clear</button>)}
            {/* {bustOdds.map((bust, index) => <div id='numBusts' key={index}><>{index + 1} hit{index > 0 ? 's' : ''}: </>
            <OddsCalc key={index + 50} dealerArr={dealerOdds} playerArr={bust}/>
            <HitOddsList  key={index} arr={bust}/>
            </div>)} */}

            {bustOdds.map((bust, index) => (
                <div id='numBusts' key={index}>
                  <span className="future-odds">Odds After {index + 1} hit{index > 0 ? 's' : ''}:</span>
                  <OddsCalc key={index + 50} dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerArr={bust} />
                  <button id="check-btn" onClick={() => toggleHitOddsList(index)}>
                    {hitOddsVisibility[index] ? 'Hide' : 'Details'}
                  </button>
                  <div style={{ display: hitOddsVisibility[index] ? 'block' : 'none' }}>
                    <HitOddsList className="darkgrayodds" key={index} arr={bust} />
                  </div>
                </div>
              ))}
            </>)}
              {/* <span>Odds if Hit: </span><OddsCalc dealerArr={calculateDealerOdds([dealerHand[0]], deck)} playerArr={calculatePlayerOdds(playerHand, deck, 1)} />
              <HitOddsList arr={calculatePlayerOdds(playerHand, deck, 1)} /> */}
              </>
              )}</>)}
              </div>
              
          )}
          {gameStatus === 'playerMove' && (
            <>
        {showOdds && (
            <>
            <div className="future-odds">Dealer Odds:</div>
            <OddsList arr={dealerOdds} />
            </>
        )}
        <div className="game-controls">
            <button onClick={() => hit().catch(console.error)}>Hit</button>
            <button onClick={() => stand().catch(console.error)}>Stand</button>
            
            {gameStatus ==='playerMove' && playerHand.length === 2 && (<><button onClick={doubleDown}>Double Down</button>
            <button onClick={surrender}>Surrender</button></>)}
        {!showOdds && (<button onClick={dealerOddsBtn}>Show Dealer Odds</button>)}
        {showOdds && (<button onClick={dealerOddsBtn}>Hide Dealer Odds</button>)}
        <button onClick={() => initializeGame()}>Restart</button>
        </div>
        </>
        )}
        {gameStatus === 'over' && (
          <div className="game-over">
            {winner !== 'tie' &&
            <h2 id="dScore" style={{ color: getTextColor(winner) }}>{capitalizeFirstLetter(winner)} Wins!</h2>}
            {winner === 'tie' && 
            <h2 style={{ color: 'blue' }}>Push!</h2>}
            <button onClick={() => initializeGame()}>Play Again</button>
          </div>
        )}
        </div>
      )}
    </div>
  );
}



export default Blackjack;