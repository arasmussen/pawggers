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
    client.say(target, `i don't have zoomies rn`);
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
    client.say(target, `@${user.name} you're already chasing me!`);
    return;
  }

  const tickets = 1;
  chase.chasers.push({
    userId: user.id,
    userName: user.name,
    tickets,
  });
  database.set(DB_KEY, chase);

  const ticketWord = tickets === 1 ? 'ticket' : 'tickets';
  client.say(target, `${user.name} joined the chase (${tickets} ${ticketWord})!`);
};
