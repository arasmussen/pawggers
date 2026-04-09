const database = require('../database');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const SocketServer = require('../managers/socket');
const isMod = require('../util/isMod');

const MANUAL_ID = 'manual_nextbreak';

module.exports = function(context) {
  const { client, target } = context;
  if (!client || !target) return;

  if (!context?.['user-id'] || !isMod(context['user-id'])) {
    client.say(target, `mods only`);
    return;
  }

  const queueKey = 'redeemQueue';
  const queue = database.get(queueKey) || [];
  const next = queue.filter((x) => String(x?.id) !== MANUAL_ID);

  const removed = next.length !== queue.length;
  database.set(queueKey, next);

  SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
  client.say(target, removed ? `cleared next break` : `no manual next break to clear`);
};

