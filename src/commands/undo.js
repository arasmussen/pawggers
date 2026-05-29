const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const generateDecoyTaskBody = require('../tasks/generateDecoyTaskBody');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const setupTaskTable = require('../tasks/setupTaskTable');
const socket = require('../managers/socket');
const {
  getUserTaskEntries,
  getUserTaskEntryByOrdinal,
  markTaskUndone,
  reconcileUserFocus,
  taskSay,
} = require('../tasks/taskUtils');

function getMostRecentlyDoneEntry(todoTable, username) {
  const doneEntries = getUserTaskEntries(todoTable, username).filter((e) => e.task.done);
  if (doneEntries.length === 0) return null;
  return doneEntries.reduce((latest, entry) => {
    if (!latest) return entry;
    return (entry.task.doneAt || 0) > (latest.task.doneAt || 0) ? entry : latest;
  }, null);
}

module.exports = function(context) {
  const { client, target } = context;

  if (!context?.['display-name'] || !context?.['user-id']) {
    console.log('validation failed');
    return;
  }

  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };

  const todoTable = setupTaskTable();
  const now = Date.now();
  const arg = context.variables.join(' ').trim();

  let entry = null;

  if (arg === '') {
    entry = getMostRecentlyDoneEntry(todoTable, user.name);
    if (!entry) {
      taskSay(client, target, `@${user.name}, you don't have any completed tasks to undo`);
      return;
    }
  } else if (!/^\d+$/.test(arg)) {
    taskSay(client, target, `@${user.name}, use !undo or !undo [task number]`);
    return;
  } else {
    const n = parseInt(arg, 10);
    entry = getUserTaskEntryByOrdinal(todoTable, user.name, n);
    if (!entry) {
      taskSay(client, target, `@${user.name}, there is no task #${n}`);
      return;
    }
    if (!entry.task.done) {
      taskSay(client, target, `@${user.name}, task #${n} is already incomplete`);
      return;
    }
  }

  markTaskUndone(entry.task);
  reconcileUserFocus(todoTable, user.id, user.name, now);
  database.set('todoTable', todoTable);

  taskSay(client, target, `@${user.name}, task #${entry.userOrdinal} is now incomplete`);

  socket.emit('update-task-view', generateTaskBody());
  socket.emit('update-decoy-task-view', generateDecoyTaskBody());
  socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
};
