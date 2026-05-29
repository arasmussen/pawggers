const discord = require('../managers/discord');
const isMod = require('../util/isMod');
const isSarah = require('../util/isSarah');

const GOS_ADDICTS_ROLE_ID = '968908995547004949';

module.exports = async function(context) {
  const { client, target } = context;

  if (!context?.['display-name'] || !context?.['user-id']) {
    return;
  }

  const userId = context['user-id'];
  if (!isSarah(userId) && !isMod(userId)) {
    client.say(target, `mods only`);
    return;
  }

  try {
    await discord.sendMessage(
      'cowork-chat',
      `<@&${GOS_ADDICTS_ROLE_ID}>`,
      {
        allowedMentions: {
          parse: [],
          roles: [GOS_ADDICTS_ROLE_ID],
        },
      }
    );
  } catch (e) {
    console.log('[playgos] discord send failed', e);
    client.say(target, `discord send failed`);
  }
};
