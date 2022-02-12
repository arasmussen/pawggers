const { ClientRequest } = require('http');
const database = require('../database');
const getPeriod = require('../util/getPeriod');
const isSarah = require('../util/isSarah');

module.exports = function(context) {
  const { client, target } = context;

  // data validation
  if (!context?.['display-name'] ||
      !context?.['user-id']) {
    console.log('validation failed');
    return;
  }

  // get user
  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };

  // return if not sarah
  if (!isSarah(user.id)) {
    client.say(target, `Nice try, ${user.name}`);
    return;
  }

  // update database
  let ttolTable = database.get('ttolTable');
  ttolTable = ttolTable || {};
  database.set('ttolTable', ttolTable);

  // if game isn't active
  if (!ttolTable.active) {
    client.say(target, `${user.name}, we're not playing TTOL right now.`);
    return;
  }

  // get answer
  const answer = context.variables.join(' ').trim().toLowerCase();

  // handle if guess isn't legit
  if (answer !== 'a' && answer !== 'b' && answer !== 'c') {
    client.say(target, `${user.name}, what's the answer?`);
    return;
  }

  // people who guessed A
  const AGuessers = Object.keys(ttolTable.guesses).filter((userID) => {
    return ttolTable.guesses[userID].guess === 'a';
  }).length;

  // people who guessed B
  const BGuessers = Object.keys(ttolTable.guesses).filter((userID) => {
    return ttolTable.guesses[userID].guess === 'b';
  }).length;

  // people who guessed C
  const CGuessers = Object.keys(ttolTable.guesses).filter((userID) => {
    return ttolTable.guesses[userID].guess === 'c';
  }).length;

  // get people who got it right
  const correctGuesserIDs = Object.keys(ttolTable.guesses).filter((userID) => {
    return ttolTable.guesses[userID].guess === answer;
  });

  // get period
  const period = getPeriod();

  // give those people pawggers
  correctGuesserIDs.forEach((guesserID) => {
    let userSpendTable = database.get('userSpendTable');
    userSpendTable = userSpendTable || {};
    userSpendTable[period] = userSpendTable[period] || {};
    userSpendTable[period][guesserID] = userSpendTable[period][guesserID] || {};
    userSpendTable[period][guesserID].spend = userSpendTable[period][guesserID].spend || 0;
    userSpendTable[period][guesserID].spend += 2000;
    database.set('userSpendTable', userSpendTable);
  });

  // print result
  client.say(target, `${AGuessers} ${AGuessers === 1 ? 'person' : 'people'} answered A, ${BGuessers} ${BGuessers === 1 ? 'person' : 'people'} answered B, and ${CGuessers} ${CGuessers === 1 ? 'person' : 'people'} answered C.`);
  const correctGuesses = correctGuesserIDs.length;
  client.say(target, `The answer was ${answer.toUpperCase()}! ${correctGuesses} ${correctGuesses === 1 ? 'person' : 'people'} got it right. Thanks for playing Two Truths, One Lie!`);

  // reset table after game
  ttolTable = {
    active: false,
    guesses: [],
  };
  database.set('ttolTable', ttolTable);
}
