const database = require('../database');

const NumLeaders = 5;

module.exports = function(context) {

  // update database
  const subPointsTable = database.get('subPoints') || {};

  // get top 5 users
  const userIDs = Object.keys(subPointsTable).sort((userID1, userID2) => {
    if (subPointsTable[userID1] === subPointsTable[userID2]) {
      return 0;
    } else if (subPointsTable[userID1] > subPointsTable[userID2]) {
      return -1;
    } else {
      return 1;
    }
  }).filter((userID, i) => {
    return i < NumLeaders;
  });

  // print result
  const userTable = database.get('userTable') || {};
  const top5 = userIDs.map((userID) => {
    const userName = userTable[userID].name;
    return `${userName} x ${subPointsTable[userID]}`;
  }).join(', ');
  const { client, target } = context;
  //client.say(target, `Top 5 are: ${top5}`);
}
