const abbreviateNumber = require ('../util/abbreviateNumber');
const { ClientRequest } = require('http');
const { client } = require('tmi.js');
const database = require('../database');
const getPeriod = require('../util/getPeriod');

const ModIDs = [
  '594470471', // cait
  '151640996', // imad
  '509514282', // rngie
  '679555136', // xhumming
  '470611865', // razzy
];
const NumLeaders = 5;

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
    return !ModIDs.includes(userID);
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
  client.say(target, `Top pawggers spenders this month so far are... ${leaderboard}`);
}