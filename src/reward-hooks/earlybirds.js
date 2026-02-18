const abbreviateNumber = require ('../util/abbreviateNumber');
const { ClientRequest } = require('http');
const database = require('../database');
const getDay = require('../util/getDay');
const getPeriod = require('../util/getPeriod');
const twitch = require('../managers/twitch');
const { threadId } = require('worker_threads');

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

  // early birds database
  const today = getDay();
  let earlyBirdTable = database.get('earlyBirdTable');

  earlyBirdTable = earlyBirdTable || {
    earlyBirds: [],
  };

  // calculate how many pawggers
  var pawggers = 0;
  var place = '';
  const numBirds = earlyBirdTable.earlyBirds.length;

  // Weird Twitch order
  if (numBirds === 0) {
    pawggers = 500;
    place = 'THIRD';
  } else if (numBirds === 1) {
    pawggers = 2000;
    place = 'FIRST';
  } else {
    pawggers = 1000;
    place = 'SECOND';
  }
  // add user to list
  const newEarlyBird = {
    date: today,
    username: user.name,
  };
  earlyBirdTable.earlyBirds.push(newEarlyBird);

  // reset after third
  if (earlyBirdTable.earlyBirds.length === 3) {
    earlyBirdTable.earlyBirds = [];
  }
  database.set('earlyBirdTable', earlyBirdTable);

  // update database
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  userSpendTable[period][user.id] = userSpendTable[period][user.id] || {};
  userSpendTable[period][user.id].spend = userSpendTable[period][user.id].spend || 0;
  userSpendTable[period][user.id].spend += pawggers;
  database.set('userSpendTable', userSpendTable);

  // get total pawggers
  const spend = abbreviateNumber(Number(userSpendTable[period][user.id].spend));
  
  // print out numbers
  var prettyPawggers = pawggers >= 1000 ? pawggers.toLocaleString() : pawggers.toString();

  // print result
  twitch.client.say('#xhumming', `${user.name} comes in ${place} to claim a worm for ${prettyPawggers} pawggers! They now have ${spend} pawggers.`);
}
