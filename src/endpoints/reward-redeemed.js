const database = require('../database');

module.exports = function(request, response) {
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
  const now = new Date();
  const period = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
  const periodKey = JSON.stringify(period);

  // get spend
  const spend = data.event.reward.cost;

  // update database
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[periodKey] = userSpendTable[periodKey] || {};
  userSpendTable[periodKey][user.id] = userSpendTable[periodKey][user.id] || {};
  userSpendTable[periodKey][user.id].spend = userSpendTable[periodKey][user.id].spend || 0;
  userSpendTable[periodKey][user.id].spend += spend;
  database.set('userSpendTable', userSpendTable);

  // respond
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end('success');
}