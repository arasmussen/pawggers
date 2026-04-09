const database = require('../database');
const config = require('../config');

function formatItem(x) {
  const title = x?.reward?.title || 'unknown reward';
  return `${title}`;
}

const MAX_ITEMS_IN_CHAT = 10;

module.exports = function(context) {
  const { client, target } = context;
  if (!client || !target) return;

  const allowIds = config?.redeemQueue?.rewardIds;
  const allowlistEnabled = Array.isArray(allowIds) && allowIds.length > 0;

  const queue = database.get('redeemQueue') || [];
  let pending = queue.filter((x) => String(x?.status || 'unfulfilled').toLowerCase() === 'unfulfilled');
  if (allowlistEnabled) {
    pending = pending.filter((x) => allowIds.includes(x?.reward?.id));
  }

  pending = pending.slice().sort((a, b) => {
    const ta = Date.parse(a?.redeemedAt || '') || 0;
    const tb = Date.parse(b?.redeemedAt || '') || 0;
    return ta - tb;
  });

  if (pending.length === 0) {
    client.say(target, `no redeems in queue rn so we yap!`);
    return;
  }

  const shown = pending.slice(0, MAX_ITEMS_IN_CHAT);
  const line = shown.map(formatItem).join(', ');
  const more = pending.length > shown.length
    ? ` (+${pending.length - shown.length} more)`
    : '';
  client.say(target, `${pending.length} in redeem queue: ${line}${more}`);
};
