const { ClientRequest } = require('http');
const database = require('../database');
const twitch = require('../managers/twitch');
const getDay = require('../util/getDay');

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

  // update database
  const today = getDay();
  let giveawayEntryTable = database.get('giveawayEntryTable');

  giveawayEntryTable = giveawayEntryTable || {
    entries: [],
  };

  // handle if user already entered
  const userHasEnteredToday = giveawayEntryTable.entries.find((entry) => {
    return entry.date === today && entry.username === user.name;
  });

  if (userHasEnteredToday) {
    twitch.client.say('#xhumming', `You have already entered the giveaway today.`);
    return;
  }

  // add user to list
  const newEntry = {
    date: today,
    username: user.name,
  };
  giveawayEntryTable.entries.push(newEntry);
  database.set('giveawayEntryTable', giveawayEntryTable);
}
