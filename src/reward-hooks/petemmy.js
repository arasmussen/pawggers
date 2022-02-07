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

  // print result
  const textList = ['Woof woof thanks for pets', 'I LOVE pets! Thanks', 'Pets are the bestest! Thanks', 'Yay for pets! Thanks', 'Woof woof woof'];
  const text = textList[Math.floor(Math.random() * textList.length)];

  twitch.client.say('#xhumming', `${text} @${user.name}`);
}
