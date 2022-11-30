const abbreviateNumber = require ('../util/abbreviateNumber');
const { ClientRequest } = require('http');
const database = require('../database');
const getPeriod = require('../util/getPeriod');
const isMod = require('../util/isMod');
const isSarah = require('../util/isSarah');

const NumLeaders = 10;

module.exports = function(context) {
  // get period
  const period = getPeriod();

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
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  database.set('userSpendTable', userSpendTable);

  // get top 10 users
  const periodData = userSpendTable[period];
  const userIDs = Object.keys(periodData).sort((userID1, userID2) => {
    if (periodData[userID1].spend === periodData[userID2].spend) {
      return 0;
    } else if (periodData[userID1].spend > periodData[userID2].spend) {
      return -1;
    } else {
      return 1;
    }
  }).filter((userID) => {
    return !isMod(userID);
  }).filter((userID, i) => {
    return i < NumLeaders;
  });

  // print result
  const userTable = database.get('userTable');
  const leaderboard = userIDs.map((userID) => {
    const userName = userTable[userID].name;
    return `${userName}`;
  });
  const timesTable = {
    0: 0,
    1: 5,
    2: 4,
    3: 4,
    4: 3,
    5: 3,
    6: 2,
    7: 2,
    8: 1,
    9: 1,
  };
  const finalWheel = leaderboard.map((userName, i) => {
    const times = timesTable[i];
    let nameWheel = [];
    for (let i = 0; i < times; i++) {
      nameWheel.push(userName);
    }
    return nameWheel.join(' ');
  }).join(' ');
  const { client, target } = context;
  client.say(target, `${finalWheel}`);
}
