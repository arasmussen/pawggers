const { ClientRequest } = require('http');
const database = require('../database');
const isMod = require('../util/isMod');

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
  if (!isMod(user.id)) {
    client.say(target, `Sorry, only mods can build raid messages`);
    return;
  }
  
  // get msg
  const msg = context.variables.join(' ') + ' ';
  
  // repeat msg to make raidmsg
  const raidmsg = msg.repeat(6);
  
  // print result
  client.say(target, `${raidmsg}`);
}
