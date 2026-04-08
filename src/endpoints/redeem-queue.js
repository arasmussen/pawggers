const database = require('../database');
const { URL } = require('url');

function sendJson(response, statusCode, obj) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(obj));
}

module.exports = function(request, response) {
  // Simple read-only endpoint for current reward redemption queue
  const url = new URL(request.url, 'https://emmy.dog/');
  const status = (url.searchParams.get('status') || 'unfulfilled').toLowerCase();
  const limitParam = Number(url.searchParams.get('limit') || 50);
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(200, limitParam)) : 50;

  const queue = database.get('redeemQueue') || [];
  const filtered = status === 'all'
    ? queue
    : queue.filter((x) => String(x?.status || 'unfulfilled').toLowerCase() === status);

  const items = filtered.slice(-limit).reverse(); // newest first
  sendJson(response, 200, { ok: true, status, count: items.length, items });
};

