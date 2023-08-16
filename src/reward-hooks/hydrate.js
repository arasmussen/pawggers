const abbreviateNumber = require ('../util/abbreviateNumber');
const { ClientRequest } = require('http');
const database = require('../database');
const getDay = require('../util/getDay');
const getPeriod = require('../util/getPeriod');
const twitch = require('../managers/twitch');

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

  // get period
  const period = getPeriod();

  // early birds database
  const today = getDay();
  let hydratorsTable = database.get('hydratorsTable');

  hydratorsTable = hydratorsTable || {
    hydrators: [],
  };

  // add user to list
  const newHydrator = {
    date: today,
    username: user.name,
  };
  hydratorsTable.hydrators.push(newHydrator);
  database.set('hydratorsTable', hydratorsTable);

  // print result
  twitch.client.say('#xhumming', `woof`);
}