const database = require('../database');
const getPeriod = require('../util/getPeriod');
const recordDailyPawggersEarned = require('../util/recordDailyPawggersEarned');
const rewardHooks = require('../reward-hooks');
const twitch = require('../managers/twitch');
const config = require('../config');
const socket = require('../managers/socket');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');

module.exports = function(request, response) {
  console.log(`[${new Date().toISOString()}] /api/reward-redeemed`);
  const data = request.postData;

  const msgType = (request.headers['twitch-eventsub-message-type'] || '').toLowerCase();

  if (msgType === 'webhook_callback_verification' && data?.challenge) {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(data.challenge);
    console.log('EventSub: reward-redeemed callback verified');
    return;
  }

  if (msgType === 'revocation') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end('{}');
    console.warn('EventSub: reward-redeemed subscription revoked');
    return;
  }

  const rewardCost = data?.event?.reward?.cost;
  const costOk = typeof rewardCost === 'number' && rewardCost >= 0;
  if (!data?.event?.user_id || !data?.event?.user_name || !costOk) {
    console.warn(
      'reward-redeemed: bad data (expected EventSub notification with event.user_id, event.user_name, event.reward.cost)',
      { hasEvent: Boolean(data?.event), msgType: msgType || '(none)' }
    );
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end('bad data');
    return;
  }
  
  // get user
  const user = {
    id: data.event.user_id,
    name: data.event.user_name,
  };

  // get period
  const period = getPeriod();

  // get spend
  const spend = rewardCost;

  // update database
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  userSpendTable[period][user.id] = userSpendTable[period][user.id] || {};
  userSpendTable[period][user.id].spend = userSpendTable[period][user.id].spend || 0;
  userSpendTable[period][user.id].spend += spend;
  database.set('userSpendTable', userSpendTable);
  recordDailyPawggersEarned(user.id, user.name, spend);

  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  // respond
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end('success');

  // store redeem in local queue (for overlay/debug/admin tooling)
  try {
    const event = data?.event;
    const allowIds = config?.redeemQueue?.rewardIds;
    const allowlistEnabled = Array.isArray(allowIds) && allowIds.length > 0;
    const rewardId = event?.reward?.id;
    if (allowlistEnabled && !allowIds.includes(rewardId)) {
      // still run hook logic below, but don't store in the queue
    } else {
      const queueKey = 'redeemQueue';
      const queue = database.get(queueKey) || [];

      const entry = {
        id: event?.id || `${Date.now()}_${event?.user_id || 'unknown'}_${event?.reward?.id || 'unknown'}`,
        redeemedAt: event?.redeemed_at || new Date().toISOString(),
        status: event?.status || 'unfulfilled',
        user: {
          id: event?.user_id,
          name: event?.user_name,
        },
        reward: {
          id: event?.reward?.id,
          title: event?.reward?.title,
          cost: event?.reward?.cost,
        },
        userInput: event?.user_input || '',
      };

      queue.push(entry);
      // keep the queue from growing forever
      const MAX = 200;
      const trimmed = queue.length > MAX ? queue.slice(queue.length - MAX) : queue;
      database.set(queueKey, trimmed);

      // notify overlay clients
      socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
    }
  } catch (e) {
    console.warn('reward-redeemed: failed to record redeemQueue entry', e?.message || e);
  }

  console.log(`Name: ${data.event.reward.title} ID: ${data.event.reward.id}`);

  // run reward hook, if there is one
  const rewardHook = rewardHooks[data.event.reward.id];
  if (!rewardHook) {
    return;
  }

  rewardHook(data);
}
