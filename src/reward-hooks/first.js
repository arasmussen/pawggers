const abbreviateNumber = require ('../util/abbreviateNumber');
const { ClientRequest } = require('http');
const database = require('../database');
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

  // update database
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  userSpendTable[period][user.id] = userSpendTable[period][user.id] || {};
  userSpendTable[period][user.id].spend = userSpendTable[period][user.id].spend || 0;
  userSpendTable[period][user.id].spend += 1000;
  database.set('userSpendTable', userSpendTable);

  // get total pawggers
  const spend = abbreviateNumber(Number(userSpendTable[period][user.id].spend));

  const storyList = ['The battle was fierce but', 'That was a tough battle but', 'That was an intense fight but', 'We got some lurkers but who will win?', 'Early bird catches the worm.'];
  const resultList = ['snatches first', 'comes out on top', 'grabs first, and the crowd goes wild', 'winnnnnnns'];
  const story = storyList[Math.floor(Math.random() * storyList.length)];
  const result = resultList[Math.floor(Math.random() * resultList.length)];

  // print result
  twitch.client.say('#xhumming', `${story} ${user.name} ${result}! They now have ${spend} pawggers.`);
}
