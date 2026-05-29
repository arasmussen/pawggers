const database = require('../database');
const isMod = require('../util/isMod');
const generateTaskBody = require('../tasks/generateTaskBody');
const generateDecoyTaskBody = require('../tasks/generateDecoyTaskBody');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const setupTaskTable = require('../tasks/setupTaskTable');
const socket = require('../managers/socket');
const {
  getFocusedTaskId,
  setFocusedTaskId,
  getUserTaskEntryByOrdinal,
  getActiveUserTaskEntries,
  getFirstIncompleteUserOrdinal,
  pauseTaskTimer,
  reconcileUserFocus,
  switchFocusToUserOrdinal,
} = require('../tasks/taskUtils');

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

  const userIsMentioned = context.variables.length === 1 && context.variables[0][0] === '@';

  if (userIsMentioned) {
    if (!isMod(user.id)) {
      client.say(target, 'Only mods can remove tasks by others');
      return;
    }

    const atUsername = context.variables[0].replace(/^@/, '');
    todoTable.tasks = todoTable.tasks.filter((task) => {
      return task.username.toLowerCase() !== atUsername.toLowerCase();
    });
    database.set('todoTable', todoTable);

    client.say(target, `Removed all tasks from @${atUsername}`);

    socket.emit('update-task-view', generateTaskBody());
    socket.emit('update-decoy-task-view', generateDecoyTaskBody());
    socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
    return;
  }

  const arg = context.variables.join(' ').trim().toLowerCase();
  const activeEntries = getActiveUserTaskEntries(todoTable, user.name);

  if (arg === 'all') {
    activeEntries.forEach(({ task }) => pauseTaskTimer(task, now));
    todoTable.tasks = todoTable.tasks.filter((t) => t.username !== user.name);
    setFocusedTaskId(user.id, null);
    database.set('todoTable', todoTable);
    client.say(target, `All tasks removed for ${user.name}`);
    socket.emit('update-task-view', generateTaskBody());
    socket.emit('update-decoy-task-view', generateDecoyTaskBody());
    socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
    return;
  }

  if (activeEntries.length === 0) {
    client.say(target, `${user.name}, you don't have any active tasks`);
    return;
  }

  let toRemove = null;

  if (/^\d+$/.test(arg)) {
    const ord = parseInt(arg, 10);
    const entry = getUserTaskEntryByOrdinal(todoTable, user.name, ord);
    if (!entry) {
      client.say(target, `${user.name}, there is no task #${ord}`);
      return;
    }
    toRemove = entry.task;
  } else if (arg === '') {
    reconcileUserFocus(todoTable, user.id, user.name, now);
    const focusId = getFocusedTaskId(user.id);
    toRemove = focusId
      ? todoTable.tasks.find((t) => t.id === focusId && t.username === user.name && !t.done)
      : null;
    if (!toRemove) {
      toRemove = activeEntries[0].task;
    }
  } else {
    client.say(target, `${user.name}, use !remove, !remove all, or !remove [task number]`);
    return;
  }

  const wasFocused = toRemove.id === getFocusedTaskId(user.id);
  pauseTaskTimer(toRemove, now);
  todoTable.tasks = todoTable.tasks.filter((t) => t !== toRemove);

  if (wasFocused) {
    setFocusedTaskId(user.id, null);
  }

  const nextOrd = getFirstIncompleteUserOrdinal(todoTable, user.name);
  if (nextOrd != null && wasFocused) {
    switchFocusToUserOrdinal(todoTable, user.id, user.name, nextOrd, now);
  } else {
    reconcileUserFocus(todoTable, user.id, user.name, now);
  }

  database.set('todoTable', todoTable);

  client.say(target, `Task removed, ${user.name}`);

  socket.emit('update-task-view', generateTaskBody());
  socket.emit('update-decoy-task-view', generateDecoyTaskBody());
  socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
};
