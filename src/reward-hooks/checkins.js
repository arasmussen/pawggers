const abbreviateNumber = require ('../util/abbreviateNumber');
const { ClientRequest } = require('http');
const database = require('../database');
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

  // checkins database
  let checkInUsersTable = database.get('checkInUsersTable');

  checkInUsersTable = checkInUsersTable || {};

  // see if user has checked in before
  const checkInUser = checkInUsersTable[user.id];

  // if they have checked in before
  if (checkInUser) {
    checkInUser.checkInCount += 1;
  } else {
    // if they have't checked in before, create new user
    checkInUsersTable[user.id] = {
      checkInCount: 1,
    };
  }
  database.set('checkInUsersTable', checkInUsersTable);

  const greetingList = ['hii!', 'good to see you!', 'heyo!', 'welcome back!', 'hey', 'hihi'];
  const greeting = greetingList[Math.floor(Math.random() * greetingList.length)];

  // confirm checkin
  twitch.client.say('#xhumming', `${greeting} ${user.name}! you have checked in ${checkInCount} ${checkInCount === 1 ? 'time' : 'times'}`);
  twitch.client.say('#xhumming', `testing checkins`);
}
