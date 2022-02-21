const escapeHTML = require('../util/escapeHTML');
const database = require('../database');

function generateTTOLData() {
  const ttolTable = database.get('ttolTable');
  const userIDs = ttolTable && ttolTable.guesses ? Object.keys(ttolTable.guesses) : [];
  const guessAmount = {
    a: 0,
    b: 0,
    c: 0,
  };
  userIDs.forEach((userID) => {
    const guess = ttolTable.guesses[userID].guess;
    guessAmount[guess] += 1;
  });
  const ttolData = [
    { x: 'A', value: guessAmount.a },
    { x: 'B', value: guessAmount.b },
    { x: 'C', value: guessAmount.c },
  ];
  return ttolData;
}

module.exports = generateTTOLData;
