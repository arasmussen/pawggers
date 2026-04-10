const database = require('../database');
const fs = require('fs');
const path = require('path');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const SocketServer = require('../managers/socket');

const MANUAL_ID = 'manual_nextbreak';
const ConfigPath = path.resolve(__dirname, '../../config.json');

function getGameBreakRewardId() {
  try {
    const config = JSON.parse(fs.readFileSync(ConfigPath, 'utf8'));
    const ids = config?.redeemQueue?.rewardIds;
    if (Array.isArray(ids) && ids.length > 0) return ids[0];
    return null;
  } catch (e) {
    console.warn('nextbreak: failed to read config.json', e?.message || e);
    return null;
  }
}

module.exports = function(context) {
  const { client, target } = context;
  if (!client || !target) return;

  const input = context.variables.join(' ').trim();
  if (!input) {
    client.say(target, `usage: !nextbreak [text]`);
    return;
  }

  const rewardId = getGameBreakRewardId();
  if (!rewardId) {
    client.say(target, `next break isn't configured yet`);
    return;
  }

  const queueKey = 'redeemQueue';
  const queue = database.get(queueKey) || [];

  // remove existing manual item if present
  const withoutManual = queue.filter((x) => String(x?.id) !== MANUAL_ID);

  // Insert a manual break at the top by giving it the oldest timestamp.
  const manual = {
    id: MANUAL_ID,
    redeemedAt: '1970-01-01T00:00:00.000Z',
    status: 'unfulfilled',
    updatedAt: new Date().toISOString(),
    user: {
      id: context?.['user-id'],
      name: context?.['display-name'],
    },
    reward: {
      id: rewardId,
      title: 'Game Break',
      cost: 0,
    },
    userInput: input,
  };

  database.set(queueKey, [manual, ...withoutManual]);

  SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
  client.say(target, `next break set to: ${input}`);
};

