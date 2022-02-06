const database = require('../database');
const getPeriod = require('../util/getPeriod');
const twitch = require('../managers/twitch');

module.exports = function(request, response) {
  console.log(`[${new Date().toISOString()}] /api/reward-redeemed`);
  const data = request.postData;

  // data validation
  if (!data?.event?.user_id ||
      !data?.event?.user_name ||
      !data?.event?.reward?.cost) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end('bad data');
  }
  
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
  userSpendTable[period][user.id].spend += spend;
  database.set('userSpendTable', userSpendTable);

  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  // respond
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end('success');

  twitch.client.say('#xhumming', `${data.event.reward.id} is the id for ${data.event.reward.title}`);
}
