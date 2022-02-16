const { ClientRequest } = require('http');
const database = require('../database');
const generateTaskBody = require('../ttol/generateTTOLBody');

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

  // if no game running
  if (!ttolTable || !ttolTable.active) {
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

  // update socket clients
  socket.emit('update-ttol-view', generateTTOLBody());
}
