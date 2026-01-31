const database = require('../database');
const setupHydratorsTable = require('../hydrators/setupHydratorsTable');

module.exports = function(data) {
  // data validation
  if (!data?.event?.user_id ||
      !data?.event?.user_name) {
    return;
  }

  // get user
  const user = {
    id: data.event.user_id,
    name: data.event.user_name,
  };

  // upsert user
  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  // hydrators table (resets daily like tasks)
  const hydratorsTable = setupHydratorsTable();
  const today = hydratorsTable.day;
  const newHydrator = {
    date: today,
    username: user.name,
  };
  hydratorsTable.hydrators.push(newHydrator);
  database.set('hydratorsTable', hydratorsTable);
  console.log('hydrate');
}