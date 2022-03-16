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

  client.say(target, `${user.name}, there ${giveawayEntryTable.entries.length === 1 ? 'is' : 'are'} ${giveawayEntryTable.entries.length} ${giveawayEntryTable.entries.length === 1 ? 'entry' : 'entries'} in total for the giveaway. You have ${totalEntriesFromUser} ${totalEntriesFromUser === 1 ? 'entry' : 'entries'}.`);
}
