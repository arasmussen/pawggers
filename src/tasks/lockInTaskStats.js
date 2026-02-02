const database = require('../database');

/**
 * Get current month key for stats (YYYY-MM).
 */
function getMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Lock in completed task counts per user for the current month,
 * using the given todoTable (before it is cleared).
 * Uses userId when present on tasks; otherwise resolves username via userTable.
 */
function lockInTaskStats(todoTable) {
  if (!todoTable?.tasks?.length) return;

  const completed = todoTable.tasks.filter((t) => t.done);
  if (completed.length === 0) return;

  const userTable = database.get('userTable') || {};
  const monthKey = getMonthKey();

  // Count completed tasks per userId
  const countsByUserId = {};
  for (const task of completed) {
    let userId = task.userId;
    if (!userId && task.username) {
      const user = Object.values(userTable).find((u) => u.name === task.username);
      userId = user?.id;
    }
    if (userId) {
      countsByUserId[userId] = (countsByUserId[userId] || 0) + 1;
    }
  }

  const stats = database.get('taskStatsByUser') || {};
  for (const [userId, count] of Object.entries(countsByUserId)) {
    stats[userId] = stats[userId] || {};
    stats[userId][monthKey] = (stats[userId][monthKey] || 0) + count;
  }
  database.set('taskStatsByUser', stats);
}

module.exports = lockInTaskStats;
module.exports.getMonthKey = getMonthKey;
