const database = require('../database');
const getDay = require('./getDay');

/**
 * Tracks pawggers earned per-day (separate from the monthly total in userSpendTable).
 * This is used for "daily top" overlays.
 *
 * Schema:
 * dailyPawggersEarnedTable = {
 *   [MM/DD/YYYY]: {
 *     [userId]: { name: string, earned: number }
 *   }
 * }
 */
module.exports = function recordDailyPawggersEarned(userId, userName, amount) {
  const earned = Number(amount) || 0;
  if (!userId || !userName || earned <= 0) return;

  const day = getDay();
  let table = database.get('dailyPawggersEarnedTable') || {};
  table[day] = table[day] || {};
  table[day][userId] = table[day][userId] || { name: userName, earned: 0 };
  table[day][userId].name = userName;
  table[day][userId].earned = (Number(table[day][userId].earned) || 0) + earned;
  database.set('dailyPawggersEarnedTable', table);
};

