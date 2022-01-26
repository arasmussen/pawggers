const abbreviateNumber = require ('../util/abbreviateNumber');
const { ClientRequest } = require('http');
const database = require('../database');
const getPeriod = require('../util/getPeriod');

module.exports = function(context) {
  // data validation
  if (!context?.['display-name'] ||
      !context?.['user-id']) {
    console.log('validation failed');
    return;
  }

  // get user
  let user;
  const lookupForDifferentUser = context.variables.length === 1;
  if (lookupForDifferentUser) {
    const username = context.variables[0].replace(/^@/, '');
    const isUsernameValid = username.match(/^[a-z0-9][a-z0-9_]{2,23}$/i);
    if (!isUsernameValid) {
      const { client, target } = context;
      client.say(target, `Beep boop, ${username} doesn't look like a valid username`);
      return;
    }
    
    const userTable = database.get('userTable');
    const userID = Object.keys(userTable).find((userID) => {
      return userTable[userID].name.toLowerCase() === username.toLowerCase();
    });
    if (!userID) {
      const { client, target } = context;
      client.say(target, `Beep boop, couldn't find ${username}`);
      return;
    }
    user = {
      id: userID,
      name: username,
    };
  } else {
    user = {
      id: context['user-id'],
      name: context['display-name'],
    };
  }

  // get period
  const period = getPeriod();

  // update database
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  userSpendTable[period][user.id] = userSpendTable[period][user.id] || {};
  userSpendTable[period][user.id].spend = userSpendTable[period][user.id].spend || 0;
  database.set('userSpendTable', userSpendTable);

  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  // get spend
  const spend = abbreviateNumber(Number(userSpendTable[period][user.id].spend));

  // print result
  const { client, target } = context;
  if (lookupForDifferentUser) {  
    client.say(target, `${user.name} has earned ${spend} pawggers so far this month`);
  } else {
    client.say(target, `${user.name}, you have earned ${spend} pawggers so far this month`);
  }
}
