const database = require('../database');
const { DB_KEY } = require('../zoomies/chaseManager');

module.exports = function(context) {
  const { client, target } = context;

  if (!context?.['display-name'] ||
      !context?.['user-id']) {
    return;
  }

  const chase = database.get(DB_KEY);
  if (!chase?.redeemerId) {
    client.say(target, `There's no active Zoomies chase right now.`);
    return;
  }

  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };

  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  const existing = chase.chasers.find(
    (c) => String(c.userId) === String(user.id)
  );
  if (existing) {
    client.say(target, `${user.name}, you're already in this chase — one entry per person!`);
    return;
  }

  const tickets = user.id === chase.redeemerId ? 5 : 1;
  chase.chasers.push({
    userId: user.id,
    userName: user.name,
    tickets,
  });
  database.set(DB_KEY, chase);

  const ticketWord = tickets === 1 ? 'ticket' : 'tickets';
  client.say(target, `${user.name} joined the chase (${tickets} ${ticketWord})!`);
};
