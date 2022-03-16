const { ClientRequest } = require('http');
const database = require('../database');

module.exports = function(context) {
  const { client, target } = context;

  // data validation
  if (!context?.['display-name'] ||
      !context?.['user-id']) {
    console.log('validation failed');
    return;
  }

  // get user
  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };

  // update database
  let giveawayEntryTable = database.get('giveawayEntryTable');

  giveawayEntryTable = giveawayEntryTable || {
    entries: [],
  };

  // find how many entries user has
  const totalEntriesFromUser = giveawayEntryTable.entries.filter((entry) => {
    return entry.username === user.name;
  }).length;

  client.say(target, `${user.name}, ${giveawayEntryTable.entries.length} people have entered the giveaway so far and you have ${totalEntriesFromUser} entries.`);
}
