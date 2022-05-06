const database = require('../database');
const getPeriod = require('../util/getPeriod');

module.exports = function(request, response) {
  console.log(`[${new Date().toISOString()}] /api/channel-gift-sub`);
  const data = request.postData;

  // respond
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end(data.challenge);
}
