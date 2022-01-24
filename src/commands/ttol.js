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

  // get guess
  const guess = context.variables.join(' ').trim().toLowerCase();

  // handle if guess isn't legit
  if (guess !== 'a' && guess !== 'b' && guess !== 'c') {
    client.say(target, `${user.name}, guess either A, B, or C.`);
    return;
  }

  // add guess to list
  ttolTable[user.id] = { guess };
  database.set('ttolTable', ttolTable);

  // consider whispering to user they guessed
}
