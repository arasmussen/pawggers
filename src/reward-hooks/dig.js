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

  // dig odds
  // 5% chance to find treat for emmy
  // 15% chance 0-100
  // 33% chance 100-500
  // 28% chance 500-1000
  // 12% chance 1000-1500
  // 7% chance 1500-2000
  const randomizer = Math.floor(Math.random() * 100);
  // chance for pirate
  const pirateRandomizer = Math.floor(Math.random() * 100);

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let foundPawggers = 0;
  if (randomizer < 5) {
    numberOfDigs = getRandomInt(1, 4);
  } else if (randomizer < 20) {
    foundPawggers = getRandomInt(1, 100);
    sentiment = 'Could be worse?'
    numberOfDigs = 1;
  } else if (randomizer < 53) {
    foundPawggers = getRandomInt(100, 500);
    sentiment = 'Nice!'
    numberOfDigs = 2;
  } else if (randomizer < 81) {
    foundPawggers = getRandomInt(500, 1000);
    sentiment = 'Not a bad haul!'
    numberOfDigs = 3;
  } else if (randomizer < 93) {
    foundPawggers = getRandomInt(1000, 1500);
    sentiment = 'That\'s a lot of pawggers!'
    numberOfDigs = 4;
  } else {
    foundPawggers = getRandomInt(1500, 2000);
    sentiment = 'The motherload!!'
    numberOfDigs = 5;
  }

  // update database
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  userSpendTable[period][user.id] = userSpendTable[period][user.id] || {};
  userSpendTable[period][user.id].spend = userSpendTable[period][user.id].spend || 0;
  // don't add pawggers if pirate (10% chance)
  let bonusPawggers = getRandomInt(500, 2000);
  if (pirateRandomizer > 10) {
    userSpendTable[period][user.id].spend += foundPawggers;
  } else {
    // REMOVE THIS AFTER HOLIDAYS
    userSpendTable[period][user.id].spend += foundPawggers + bonusPawggers;
  }
  database.set('userSpendTable', userSpendTable);

  // get total pawggers
  const spend = abbreviateNumber(Number(userSpendTable[period][user.id].spend));

  // print result
  twitch.client.say('#xhumming', `${user.name} is digging for pawggers…`);
  for (let i = 1; i < numberOfDigs + 1; i++) {
    setTimeout(() => {
      twitch.client.say('#xhumming', `dig dig dig…`);
    }, i * 1200);
  }
  if (randomizer < 5) {
    setTimeout(() => {
      twitch.client.say('#xhumming', `Wait… what's this? ${user.name} found a treat for Emmy!`);
    }, (numberOfDigs + 1) * 1200);
  } else {
    setTimeout(() => {
      twitch.client.say('#xhumming', `${user.name} found ${foundPawggers} pawggers! ${pirateRandomizer <= 10 ? `Oh wait… friendly holiday elves are spreading holiday cheer with ${bonusPawggers} bonus pawggers! emmmyElfPeep They now have ${spend} pawggers!` : `${sentiment} They now have ${spend} pawggers.`}`);
      //twitch.client.say('#xhumming', `${user.name} found ${foundPawggers} pawggers! ${pirateRandomizer <= 9 ? 'But wait… A pesky pirate stole their loot. Leaving them with… nothing…' : `${sentiment} They now have ${spend} pawggers.`}`);
    }, (numberOfDigs + 1) * 1200);
  }
}