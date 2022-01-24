const { ClientRequest } = require('http');
const { client } = require('tmi.js');
const database = require('../database');

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

  // update database
  let ttolTable = database.get('ttolTable');
  ttolTable = ttolTable || {};
  database.set('ttolTable', ttolTable);

  // if game isn't active
  if (!ttolTable.active) {
    client.say(target, `${user.name}, we're not playing a game right now.`);
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

  // print result
  client.say(target, `${AGuessers} ${AGuessers === 1 ? 'person' : 'people'} answered A, ${BGuessers} ${BGuessers === 1 ? 'person' : 'people'} answered B, and ${CGuessers} ${CGuessers === 1 ? 'person' : 'people'} answered C.`);
}
