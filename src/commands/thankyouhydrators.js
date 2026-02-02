const database = require('../database');
const getPeriod = require('../util/getPeriod');
const isSarah = require('../util/isSarah');
const setupHydratorsTable = require('../hydrators/setupHydratorsTable');

module.exports = function(context) {
  const { client, target } = context;

  if (!context?.['display-name'] || !context?.['user-id']) return;

  const user = { id: context['user-id'], name: context['display-name'] };
  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  if (!isSarah(user.id)) {
    client.say(target, `Nice try, ${user.name}`);
    return;
  }

  const hydratorsTable = setupHydratorsTable();
  const uniqueNames = [...new Set((hydratorsTable.hydrators || []).map((h) => h.username))];

  const usernameToUser = {};
  Object.keys(userTable).forEach((id) => {
    const u = userTable[id];
    usernameToUser[u.name.toLowerCase()] = u;
  });
  const toPay = uniqueNames.filter((name) => usernameToUser[name.toLowerCase()]);

  const period = getPeriod();
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  toPay.forEach((username) => {
    const u = usernameToUser[username.toLowerCase()];
    userSpendTable[period][u.id] = userSpendTable[period][u.id] || {};
    userSpendTable[period][u.id].spend = (userSpendTable[period][u.id].spend || 0) + 2000;
  });
  database.set('userSpendTable', userSpendTable);

  const list =
    toPay.length <= 2
      ? toPay.join(' and ')
      : toPay.slice(0, -1).join(', ') + ', and ' + toPay[toPay.length - 1];

  client.say(
    target,
    `Thank you to our hydrators today: ${list}! You all got 2,000 more pawggers emmmyCheer`
  );

  hydratorsTable.hydrators = [];
  database.set('hydratorsTable', hydratorsTable);
};
