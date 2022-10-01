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

  // early birds database
  const today = getDay();
  let earlyBirdTable = database.get('earlyBirdTable');

  earlyBirdTable = earlyBirdTable || {
    earlyBirds: [],
  };

  // add user to list
  const newEarlyBird = {
    date: today,
    username: user.name,
  };
  earlyBirdTable.earlyBirds.push(newEarlyBird);
  database.set('earlyBirdTable', earlyBirdTable);

  // calculate how many pawggers
  var pawggers = 0;
  var place = '';
  if (earlyBirdTable.earlyBirds.length === 1) {
    pawggers = 1000;
    place = 'FIRST';
  } else if (earlyBirdTable.earlyBirds.length === 2) {
    pawggers = 500;
    place = 'SECOND';
  } else {
    pawggers = 250;
    place = 'THIRD';
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
  var prettyPawggers = '';
  if (pawggers === 1000) {
    prettyPawggers = '1,000';
  } else {
    prettyPawggers = pawggers.toString();
  }

  // print result
  twitch.client.say('#xhumming', `${user.name} comes in ${place} to claim a worm for ${prettyPawggers} pawggers! They now have ${spend} pawggers.`);
}