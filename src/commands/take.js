const abbreviateNumber = require ('../util/abbreviateNumber');
const { ClientRequest } = require('http');
const { client } = require('tmi.js');
const database = require('../database');
const getPeriod = require('../util/getPeriod');
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

  // upsert user
  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  // return if not sarah
  if (!isSarah(user.id)) {
    client.say(target, `Nice try, ${user.name}`);
    return;
  }

  // validate variables
  const areVariablesValid = (
    context.variables.length === 2 &&
    context.variables.find((variable) => {
      const amount = Number(variable);
      return (
        !isNaN(amount) &&
        Number.isInteger(amount) &&
        amount > 0 &&
        amount <= 1000000
      );
    }) &&
    context.variables.find((variable) => {
      return (
        variable.match(/^@?[a-z0-9][a-z0-9_]{2,23}$/i) &&
        !variable.match(/^[0-9]+$/)
      );
    })
  );
  if (!areVariablesValid) {
    client.say(target, `Beep boop do not compute, expected "!give razzyrl 1000".`);
    return;
  }

  // get variables
  const amount = Number(context.variables.find((variable) => {
    const amount = Number(variable);
    return (
      !isNaN(amount) &&
      Number.isInteger(amount) &&
      amount > 0 &&
      amount <= 1000000
    );
  }));
  const username = context.variables.find((variable) => {
    return (
      variable.match(/^@?[a-z0-9][a-z0-9_]{2,23}$/i) &&
      !variable.match(/^[0-9]+$/)
    );
  }).replace(/@/g, '');

  // make sure user exists
  const userID = Object.keys(userTable).find((userID) => {
    return userTable[userID].name.toLowerCase() === username.toLowerCase();
  });
  if (!userID) {
    client.say(target, `Beep boop, ${username} please type !pawggers in chat`);
    return;
  }

  // get period
  const period = getPeriod();

  // update database
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  userSpendTable[period][userID] = userSpendTable[period][userID] || {};
  userSpendTable[period][userID].spend = userSpendTable[period][userID].spend || 0;
  userSpendTable[period][userID].spend -= amount;
  userSpendTable[period][userID].spend = Math.max(userSpendTable[period][userID].spend, 0);
  database.set('userSpendTable', userSpendTable);

  // get spend
  const spend = abbreviateNumber(Number(userSpendTable[period][userID].spend));

  // print result
  client.say(target, `${username}, you now have ${spend} pawggers`);
}