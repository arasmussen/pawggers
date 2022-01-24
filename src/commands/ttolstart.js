const { ClientRequest } = require('http');
const { client } = require('tmi.js');
const database = require('../database');
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

  if (ttolTable.active) {
    client.say(target, `We're already playing TTOL.`);
    return;
  }

  ttolTable = {
    active: true,
    guesses: {},
  };
  database.set('ttolTable', ttolTable);

  // print result
  client.say(target, `Two Truths, One Lie game started, use !ttol [A/B/C] to guess which is the lie.`);
}
