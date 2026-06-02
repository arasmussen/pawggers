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
  getUserTaskEntries,
  getUserTaskEntryByOrdinal,
  getActiveUserTaskEntries,
  getFirstIncompleteUserOrdinal,
  parseTaskNumberList,
  pauseTaskTimer,
  reconcileUserFocus,
  switchFocusToUserOrdinal,
  taskSay,
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
      taskSay(client, target, 'Only mods can remove tasks by others');
      return;
    }

    const atUsername = context.variables[0].replace(/^@/, '');
    todoTable.tasks = todoTable.tasks.filter((task) => {
      return task.username.toLowerCase() !== atUsername.toLowerCase();
    });
    database.set('todoTable', todoTable);

    taskSay(client, target, `Removed all tasks from @${atUsername}`);

    socket.emit('update-task-view', generateTaskBody());
    socket.emit('update-decoy-task-view', generateDecoyTaskBody());
    socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
    return;
  }

  const rawArg = context.variables.join(' ').trim();
  const arg = rawArg.toLowerCase();
  const activeEntries = getActiveUserTaskEntries(todoTable, user.name);

  if (arg === 'all') {
    activeEntries.forEach(({ task }) => pauseTaskTimer(task, now));
    todoTable.tasks = todoTable.tasks.filter((t) => t.username !== user.name);
    setFocusedTaskId(user.id, null);
    database.set('todoTable', todoTable);
    taskSay(client, target, `All tasks removed for ${user.name}`);
    socket.emit('update-task-view', generateTaskBody());
    socket.emit('update-decoy-task-view', generateDecoyTaskBody());
    socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
    return;
  }

  if (activeEntries.length === 0) {
    taskSay(client, target, `${user.name}, you don't have any active tasks`);
    return;
  }

  const numsRaw = parseTaskNumberList(rawArg);
  const seen = new Set();
  const nums = [];
  numsRaw.forEach((n) => {
    if (!seen.has(n)) {
      seen.add(n);
      nums.push(n);
    }
  });

  if (nums.length > 0) {
    const tasksToRemove = [];
    for (let i = 0; i < nums.length; i++) {
      const n = nums[i];
      const entry = getUserTaskEntryByOrdinal(todoTable, user.name, n);
      if (!entry) {
        taskSay(client, target, `${user.name}, there is no task #${n}`);
        return;
      }
      tasksToRemove.push(entry.task);
    }

    const focusId = getFocusedTaskId(user.id);
    let removedFocused = false;
    const removedOrdinals = [];

    nums.sort((a, b) => b - a).forEach((n) => {
      const entry = getUserTaskEntryByOrdinal(todoTable, user.name, n);
      if (!entry) return;
      removedOrdinals.push(n);
      const task = entry.task;
      if (task.id === focusId) removedFocused = true;
      pauseTaskTimer(task, now);
      todoTable.tasks = todoTable.tasks.filter((t) => t !== task);
    });

    if (removedFocused) {
      setFocusedTaskId(user.id, null);
    }

    const nextOrd = getFirstIncompleteUserOrdinal(todoTable, user.name);
    if (nextOrd != null && removedFocused) {
      switchFocusToUserOrdinal(todoTable, user.id, user.name, nextOrd, now);
    } else {
      reconcileUserFocus(todoTable, user.id, user.name, now);
    }

    database.set('todoTable', todoTable);

    if (tasksToRemove.length === 1) {
      taskSay(client, target, `Task #${removedOrdinals[0]} removed, ${user.name}`);
    } else {
      const list = removedOrdinals.sort((a, b) => a - b).map((n) => `#${n}`).join(', ');
      taskSay(client, target, `Tasks ${list} removed, ${user.name}`);
    }

    socket.emit('update-task-view', generateTaskBody());
    socket.emit('update-decoy-task-view', generateDecoyTaskBody());
    socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
    return;
  }

  if (arg === '') {
    reconcileUserFocus(todoTable, user.id, user.name, now);
    const focusId = getFocusedTaskId(user.id);
    let toRemove = focusId
      ? todoTable.tasks.find((t) => t.id === focusId && t.username === user.name && !t.done)
      : null;
    if (!toRemove) {
      toRemove = activeEntries[0].task;
    }

    const entry = getUserTaskEntries(todoTable, user.name).find((e) => e.task === toRemove);
    const ord = entry ? entry.userOrdinal : null;

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

    const ordMsg = ord != null ? `Task #${ord} removed` : 'Task removed';
    taskSay(client, target, `${ordMsg}, ${user.name}`);

    socket.emit('update-task-view', generateTaskBody());
    socket.emit('update-decoy-task-view', generateDecoyTaskBody());
    socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
    return;
  }

  taskSay(client, target, `${user.name}, use !remove, !remove all, or !remove 1 2 3 with task numbers`);
};
