const SocketServer = require('../managers/socket');

const database = require('../database');
const generatePointsBody = require('../subs/generatePointsBody');
const getPeriod = require('../util/getPeriod');
const tierToPoints = require('../subs/tierToPoints');

module.exports = function(request, response) {
  console.log(`[${new Date().toISOString()}] /api/channel-gift-sub`);
  const data = request.postData;

  // data validation
  if (!data?.event?.user_id ||
      !data?.event?.user_name ||
      !data?.event?.tier ||
      !data?.event?.total) {
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
  subPointsTable[user.id] += data.event.total * points;
  database.set('subPoints', subPointsTable);

  // update clients
  const pointsBody = generatePointsBody();
  SocketServer.emit('update-points-view', pointsBody);

  // respond
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('success');
}
