const { ClientRequest } = require('http');
const { client } = require('tmi.js');
const database = require('../database');
const getPeriod = require('../util/getPeriod');
const numberWithCommas = require ('../util/numberWithCommas');

module.exports = function(context) {
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
  const spend = userSpendTable[period][user.id].spend;

  // print result
  const { client, target } = context;
  client.say(target, `${context['display-name']}, you've spent ${spend} pawggers so far this month`);
}