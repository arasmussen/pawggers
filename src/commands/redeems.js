const database = require('../database');

function formatItem(x) {
  const user = x?.user?.name || 'unknown';
  const title = x?.reward?.title || 'unknown reward';
  const input = (x?.userInput || '').trim();
  const suffix = input ? ` (${input})` : '';
  return `${user}: ${title}${suffix}`;
}

module.exports = function(context) {
  const { client, target } = context;
  if (!client || !target) return;

  const queue = database.get('redeemQueue') || [];
  const pending = queue.filter((x) => String(x?.status || 'unfulfilled').toLowerCase() === 'unfulfilled');

  if (pending.length === 0) {
    client.say(target, `no redeems in queue rn`);
    return;
  }

  const last = pending.slice(-5); // keep chat spam low
  const line = last.map(formatItem).join(' | ');
  const more = pending.length > last.length ? ` (+${pending.length - last.length} more)` : '';
  client.say(target, `redeem queue (${pending.length}): ${line}${more}`);
};

