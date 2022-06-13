const discord = require('../managers/discord');
const isSarah = require('../util/isSarah');

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
  
  // return if not mod
  if (!isSarah(user.id)) {
    client.say(target, `Sorry, only Sarah can start break`);
    return;
  }

  discord.sendMessage('cowork-chat', 'Ring ring <@&971500293068046347> it\'s break time!');
} 
