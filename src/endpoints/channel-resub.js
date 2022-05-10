const database = require('../database');
const getPeriod = require('../util/getPeriod');
const tierToPoints = require('../subs/tierToPoints');

module.exports = function(request, response) {
  console.log(`[${new Date().toISOString()}] /api/channel-resub`);
  const data = request.postData;

  // data validation
  if (!data?.event?.user_id ||
      !data?.event?.user_name ||
      !data?.event?.tier) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end('bad data');
    return;
  }

  // get user
  const user = {
    id: data.event.user_id,
    name: data.event.user_name,
  };

  // update database
  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  const points = tierToPoints(data.event.tier);
  let subPointsTable = database.get('subPoints');
  subPointsTable = subPointsTable || {};
  subPointsTable[user.id] = subPointsTable[user.id] || 0;
  subPointsTable[user.id] += points;
  database.set('subPoints', subPointsTable);

  // respond
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('success');
}
