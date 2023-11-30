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

  // checkins database
  const today = getDay();
  let checkInUsersTable = database.get('checkInUsersTable');

  checkInUsersTable = checkInUsersTable || {
    checkInUsers: [],
  };

  // see if user has checked in before
  const userID = Object.keys(checkInUsersTable).find((userID) => {
    return checkInUsersTable[userID].name.toLowerCase() === username.toLowerCase();
  });
  // if they have checked in before
  if (userID) {
    checkInUsersTable[userID].checkInCount += 1;
  } else {
    // if they have't checked in before, create new user
    const newCheckInUser = {
      checkInCount: 1,
      username: user.name,
    };
    checkInUsersTable.checkInUsers.push(newCheckInUser);
  }
  database.set('checkInUsersTable', checkInUsersTable);
  console.log('checkin');
}