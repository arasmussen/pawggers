const database = require('../database');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const SocketServer = require('../managers/socket');

const MANUAL_ID = 'manual_nextbreak';

module.exports = function(context) {
  const { client, target } = context;
  if (!client || !target) return;

  const input = context.variables.join(' ').trim();
  if (!input) {
    client.say(target, `usage: !nextbreak [text]`);
    return;
  }

  const queueKey = 'redeemQueue';
  const queue = database.get(queueKey) || [];

  const manualIdx = queue.findIndex((x) => String(x?.id) === MANUAL_ID);
  if (manualIdx >= 0) {
    // Edit existing manual item in place
    queue[manualIdx] = {
      ...queue[manualIdx],
      isManual: true,
      status: 'unfulfilled',
      updatedAt: new Date().toISOString(),
      user: {
        id: context?.['user-id'],
        name: context?.['display-name'],
      },
      reward: queue[manualIdx]?.reward || { id: 'manual', title: 'Manual Break', cost: 0 },
      userInput: input,
    };
    database.set(queueKey, queue);
  } else {
    // Insert a manual break at the top by giving it the oldest timestamp.
    const manual = {
      id: MANUAL_ID,
      isManual: true,
      redeemedAt: '1970-01-01T00:00:00.000Z',
      status: 'unfulfilled',
      updatedAt: new Date().toISOString(),
      user: {
        id: context?.['user-id'],
        name: context?.['display-name'],
      },
      reward: {
        id: 'manual',
        title: 'Manual Break',
        cost: 0,
      },
      userInput: input,
    };
    database.set(queueKey, [manual, ...queue]);
  }

  SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
  client.say(target, `next break set to: ${input}`);
};

