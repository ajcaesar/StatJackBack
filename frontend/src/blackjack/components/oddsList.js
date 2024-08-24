import React from 'react';

function OddsList({ arr }) {
  return (
    <div className="odds-list">
      {arr.map((value, i) => (
        <p key={i} className={i + 17 === 22 ? 'bust' : ''}>
          {i + 17 === 22 ? 'Bust' : `${i + 17}`}: {(value*100).toFixed(0)}%
        </p>
      ))}
      {/* <div>sum: {sumArr(arr)}</div> */}
    </div>
  );
}

const sumArr = (arr) => {
    return arr.reduce((sum, num) => sum + num, 0);
};

export default OddsList;

