const abbreviateNumber = require ('../util/abbreviateNumber');
const { ClientRequest } = require('http');
const database = require('../database');
const getPeriod = require('../util/getPeriod');
const isMod = require('../util/isMod');

const NumLeaders = 10;

module.exports = function(context) {
  // get period
  const period = getPeriod();

  // update database
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  database.set('userSpendTable', userSpendTable);

  // get top 5 users
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
    const userSpend = abbreviateNumber(Number(periodData[userID].spend));
    return `${userName}: ${userSpend}`;
  }).join(', ');
  const { client, target } = context;
  client.say(target, `Top pawggers holders this month so far are... ${leaderboard}`);
}
