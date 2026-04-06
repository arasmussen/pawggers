const database = require('../database');
const getPeriod = require('../util/getPeriod');
const rewardHooks = require('../reward-hooks');
const twitch = require('../managers/twitch');

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

  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  // respond
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end('success');

  console.log(`Name: ${data.event.reward.title} ID: ${data.event.reward.id}`);

  // run reward hook, if there is one
  const rewardHook = rewardHooks[data.event.reward.id];
  if (!rewardHook) {
    return;
  }

  rewardHook(data);
}
