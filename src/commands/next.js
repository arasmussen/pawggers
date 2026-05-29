const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const generateDecoyTaskBody = require('../tasks/generateDecoyTaskBody');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const SocketServer = require('../managers/socket');
const setupTaskTable = require('../tasks/setupTaskTable');
const {
  MAX_TASKS_PER_DAY,
  MAX_TASKS_PER_DAY_MESSAGE,
  newTaskId,
  findLastUserTaskGlobalIndex,
  getFocusedTaskId,
  setFocusedTaskId,
  getActiveUserTaskEntries,
  getFirstIncompleteUserOrdinal,
  getUserTaskEntryByOrdinal,
  markTaskDone,
  clearUserFocusIfTask,
  reconcileUserFocus,
  switchFocusToUserOrdinal,
  getTaskElapsedMs,
  formatElapsedMs,
} = require('../tasks/taskUtils');
const MAX_TASK_NAME_CHARS = 200;

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

  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  const raw = context.variables.join(' ').trim();
  const todoTable = setupTaskTable();
  const now = Date.now();

  reconcileUserFocus(todoTable, user.id, user.name, now);

  const activeEntries = getActiveUserTaskEntries(todoTable, user.name);
  const focusId = getFocusedTaskId(user.id);
  let focusedTask = focusId
    ? todoTable.tasks.find((t) => t.id === focusId && t.username === user.name && !t.done)
    : null;
  if (!focusedTask && activeEntries.length > 0) {
    focusedTask = activeEntries[0].task;
  }

  const encouragementList = ['Good luck!', 'You got this!', 'Get that bread!', 'Focus up!', 'We believe in you!'];
  const encouragement = encouragementList[Math.floor(Math.random() * encouragementList.length)];

  if (raw === '') {
    if (!focusedTask) {
      client.say(target, `/me What's your next task?`);
      return;
    }
    const prevText = focusedTask.task;
    const prevElapsed = formatElapsedMs(getTaskElapsedMs(focusedTask));
    markTaskDone(focusedTask, now);
    clearUserFocusIfTask(user.id, focusedTask.id);

    const nextOrd = getFirstIncompleteUserOrdinal(todoTable, user.name);

    if (nextOrd == null) {
      reconcileUserFocus(todoTable, user.id, user.name, now);
      database.set('todoTable', todoTable);
      client.say(
        target,
        `/me Nice ${user.name}! ${prevText} is emmmyDone (took ${prevElapsed}). You're all caught up—great work! ${encouragement}`,
      );
      SocketServer.emit('update-task-view', generateTaskBody());
      SocketServer.emit('update-decoy-task-view', generateDecoyTaskBody());
      SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
      return;
    }

    switchFocusToUserOrdinal(todoTable, user.id, user.name, nextOrd, now);
    reconcileUserFocus(todoTable, user.id, user.name, now);
    database.set('todoTable', todoTable);

    const nextEntry = getUserTaskEntryByOrdinal(todoTable, user.name, nextOrd);
    const nextTaskName = nextEntry ? nextEntry.task.task : '';
    client.say(
      target,
      `/me Nice ${user.name}! ${prevText} is emmmyDone (took ${prevElapsed}). Now focused on #${nextOrd}: ${nextTaskName}—${encouragement}`,
    );

    SocketServer.emit('update-task-view', generateTaskBody());
    SocketServer.emit('update-decoy-task-view', generateDecoyTaskBody());
    SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
    return;
  }

  if (raw.length > MAX_TASK_NAME_CHARS) {
    client.say(target, `Shorten your task name please!`);
    return;
  }

  const currentUserTaskCount = todoTable.tasks.filter((t) => t.username === user.name).length;

  const isOrdinalOnly = /^\d+$/.test(raw);
  if (isOrdinalOnly) {
    const n = parseInt(raw, 10);
    if (!focusedTask) {
      const sw = switchFocusToUserOrdinal(todoTable, user.id, user.name, n, now);
      if (!sw.ok) {
        client.say(target, `${user.name}, ${sw.message}`);
        return;
      }
      reconcileUserFocus(todoTable, user.id, user.name, now);
      database.set('todoTable', todoTable);
      client.say(target, `/me ${user.name}, you didn't have a task going but now focused on #${n}: ${sw.task.task}—${encouragement}`);
      SocketServer.emit('update-task-view', generateTaskBody());
      SocketServer.emit('update-decoy-task-view', generateDecoyTaskBody());
      SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
      return;
    }

    const prevText = focusedTask.task;
    const prevElapsed = formatElapsedMs(getTaskElapsedMs(focusedTask));
    markTaskDone(focusedTask, now);
    clearUserFocusIfTask(user.id, focusedTask.id);

    const targetEntry = getUserTaskEntryByOrdinal(todoTable, user.name, n);
    if (!targetEntry || targetEntry.task.done) {
      reconcileUserFocus(todoTable, user.id, user.name, now);
      database.set('todoTable', todoTable);
      client.say(target, `${user.name}, you don't have a task #${n}`);
      SocketServer.emit('update-task-view', generateTaskBody());
      SocketServer.emit('update-decoy-task-view', generateDecoyTaskBody());
      SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
      return;
    }

    switchFocusToUserOrdinal(todoTable, user.id, user.name, n, now);
    reconcileUserFocus(todoTable, user.id, user.name, now);
    database.set('todoTable', todoTable);

    client.say(
      target,
      `/me Nice ${user.name}! ${prevText} is emmmyDone (took ${prevElapsed}). Now focused on #${n}: ${targetEntry.task.task}—${encouragement}`,
    );

    SocketServer.emit('update-task-view', generateTaskBody());
    SocketServer.emit('update-decoy-task-view', generateDecoyTaskBody());
    SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
    return;
  }

  // New task text
  if (currentUserTaskCount >= MAX_TASKS_PER_DAY) {
    client.say(target, MAX_TASKS_PER_DAY_MESSAGE);
    return;
  }

  if (focusedTask) {
    const prevText = focusedTask.task;
    const prevElapsed = formatElapsedMs(getTaskElapsedMs(focusedTask));
    markTaskDone(focusedTask, now);
    clearUserFocusIfTask(user.id, focusedTask.id);
    const totalDoneToday = todoTable.tasks.filter((t) => t.username === user.name && t.done).length;
    client.say(
      target,
      `/me Nice ${user.name}! ${prevText} is emmmyDone (took ${prevElapsed}). That's ${totalDoneToday} today—on to the next one. ${encouragement}`,
    );
  } else {
    client.say(target, `/me ${user.name}, you didn't have a task going but I've added that one. ${encouragement}`);
  }

  const insertAfter = findLastUserTaskGlobalIndex(todoTable, user.name);
  const insertIdx = insertAfter === -1 ? todoTable.tasks.length : insertAfter + 1;
  const newRow = {
    id: newTaskId(),
    userId: user.id,
    username: user.name,
    task: raw,
    done: false,
    created: now,
    accumulatedMs: 0,
    focusStartedAt: null,
  };
  todoTable.tasks.splice(insertIdx, 0, newRow);
  setFocusedTaskId(user.id, newRow.id);
  reconcileUserFocus(todoTable, user.id, user.name, now);
  database.set('todoTable', todoTable);

  SocketServer.emit('update-task-view', generateTaskBody());
  SocketServer.emit('update-decoy-task-view', generateDecoyTaskBody());
  SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
};
