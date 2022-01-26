const { ClientRequest } = require('http');
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
  ttolTable = ttolTable;
  database.set('ttolTable', ttolTable);

  // if no game running
  if (!ttolTable.active) {
    client.say(target, `${user.name}, we're not playing TTOL right now.`);
    return;
  }

  // get guess
  const guess = context.variables.join(' ').trim().toLowerCase();

  // handle if guess isn't legit
  if (guess !== 'a' && guess !== 'b' && guess !== 'c') {
    client.say(target, `${user.name}, guess either A, B, or C.`);
    return;
  }

  // add guess to list
  ttolTable.guesses[user.id] = { guess };
  database.set('ttolTable', ttolTable);
}
