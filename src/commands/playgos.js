const discord = require('../managers/discord');
const isMod = require('../util/isMod');
const isSarah = require('../util/isSarah');

const GOS_ADDICTS_ROLE_ID = '968908995547004949';
const COOLDOWN_MS = 15 * 60 * 1000;

let lastPlaygosPingAt = 0;

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

  const now = Date.now();
  const elapsed = now - lastPlaygosPingAt;
  if (lastPlaygosPingAt > 0 && elapsed < COOLDOWN_MS) {
    const minsLeft = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
    client.say(target, `playgos ping on cooldown—try again in ${minsLeft} min`);
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
    lastPlaygosPingAt = now;
  } catch (e) {
    console.log('[playgos] discord send failed', e);
    client.say(target, `discord send failed`);
  }
};
