const database = require('../database');
const getPeriod = require('../util/getPeriod');

module.exports = function(request, response) {
  console.log(`[${new Date().toISOString()}] /api/reward-updated`);
  const data = request.postData;

  // data validation
  if (!data?.event?.user_id ||
      !data?.event?.user_name ||
      !data?.event?.reward?.cost) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end('bad data');
    return;
  }

  const status = String(data?.event?.status || '').toLowerCase();
  
  // If a redeem is canceled, reverse spend (refund points)
  if (status === 'canceled') {
    // get user
    const user = {
      id: data.event.user_id,
      name: data.event.user_name,
    };

    // get period
    const period = getPeriod();

    // get spend
    const spend = data.event.reward.cost;

    // update database
    let userSpendTable = database.get('userSpendTable');
    userSpendTable = userSpendTable || {};
    userSpendTable[period] = userSpendTable[period] || {};
    userSpendTable[period][user.id] = userSpendTable[period][user.id] || {};
    userSpendTable[period][user.id].spend = userSpendTable[period][user.id].spend || 0;
    userSpendTable[period][user.id].spend -= spend;
    database.set('userSpendTable', userSpendTable);

    let userTable = database.get('userTable');
    userTable = userTable || {};
    userTable[user.id] = user;
    database.set('userTable', userTable);
  }

  // best-effort: mirror twitch status into local queue (fulfilled/canceled/etc)
  try {
    const eventId = data?.event?.id;
    if (eventId) {
      const queueKey = 'redeemQueue';
      const queue = database.get(queueKey) || [];
      const idx = queue.findIndex((x) => String(x?.id) === String(eventId));
      if (idx >= 0) {
        queue[idx] = {
          ...queue[idx],
          status: status || queue[idx]?.status || 'unfulfilled',
          updatedAt: new Date().toISOString(),
        };
        database.set(queueKey, queue);
      }
    }
  } catch (e) {
    console.warn('reward-updated: failed to update redeemQueue entry', e?.message || e);
  }

  // respond
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end('success');
}
