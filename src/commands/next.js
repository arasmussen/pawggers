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
  getActiveUserTaskEntries,
  getFirstIncompleteUserOrdinal,
  getUserTaskEntries,
  getUserTaskEntryByOrdinal,
  markTaskDone,
  clearUserFocusIfTask,
  reconcileUserFocus,
  switchFocusToUserOrdinal,
  getTaskElapsedMs,
  formatElapsedMs,
  taskSay,
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

  // Capture explicit focus before reconcile can auto-assign to the first active task.
  const focusIdBefore = getFocusedTaskId(user.id);
  const focusedTaskBefore = focusIdBefore
    ? todoTable.tasks.find((t) => t.id === focusIdBefore && t.username === user.name && !t.done)
    : null;

  const encouragementList = ['Good luck!', 'You got this!', 'Get that bread!', 'Focus up!', 'We believe in you!'];
  const encouragement = encouragementList[Math.floor(Math.random() * encouragementList.length)];

  const emitUpdates = () => {
    SocketServer.emit('update-task-view', generateTaskBody());
    SocketServer.emit('update-decoy-task-view', generateDecoyTaskBody());
    SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
  };

  if (raw === '') {
    reconcileUserFocus(todoTable, user.id, user.name, now);

    const activeEntries = getActiveUserTaskEntries(todoTable, user.name);
    const focusId = getFocusedTaskId(user.id);
    let focusedTask = focusId
      ? todoTable.tasks.find((t) => t.id === focusId && t.username === user.name && !t.done)
      : null;
    if (!focusedTask && activeEntries.length > 0) {
      focusedTask = activeEntries[0].task;
    }

    if (!focusedTask) {
      taskSay(client, target, `/me What's your next task?`);
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
      taskSay(
        client,
        target,
        `/me Nice ${user.name}! ${prevText} is emmmyDone (took ${prevElapsed}). You're all caught up—great work! ${encouragement}`,
      );
      emitUpdates();
      return;
    }

    switchFocusToUserOrdinal(todoTable, user.id, user.name, nextOrd, now);
    reconcileUserFocus(todoTable, user.id, user.name, now);
    database.set('todoTable', todoTable);

    const nextEntry = getUserTaskEntryByOrdinal(todoTable, user.name, nextOrd);
    const nextTaskName = nextEntry ? nextEntry.task.task : '';
    taskSay(
      client,
      target,
      `/me Nice ${user.name}! ${prevText} is emmmyDone (took ${prevElapsed}). Now focused on #${nextOrd}: ${nextTaskName}—${encouragement}`,
    );
    emitUpdates();
    return;
  }

  if (raw.length > MAX_TASK_NAME_CHARS) {
    taskSay(client, target, `Shorten your task name please!`);
    return;
  }

  const currentUserTaskCount = todoTable.tasks.filter((t) => t.username === user.name).length;

  const isOrdinalOnly = /^\d+$/.test(raw);
  if (isOrdinalOnly) {
    const n = parseInt(raw, 10);
    const targetEntry = getUserTaskEntryByOrdinal(todoTable, user.name, n);
    if (!targetEntry || targetEntry.task.done) {
      taskSay(client, target, `${user.name}, you don't have a task #${n}`);
      return;
    }

    if (!focusedTaskBefore) {
      const sw = switchFocusToUserOrdinal(todoTable, user.id, user.name, n, now);
      if (!sw.ok) {
        taskSay(client, target, `${user.name}, ${sw.message}`);
        return;
      }
      reconcileUserFocus(todoTable, user.id, user.name, now);
      database.set('todoTable', todoTable);
      taskSay(client, target, `/me ${user.name}, you didn't have a task going but now focused on #${n}: ${sw.task.task}—${encouragement}`);
      emitUpdates();
      return;
    }

    if (focusedTaskBefore.id === targetEntry.task.id) {
      switchFocusToUserOrdinal(todoTable, user.id, user.name, n, now);
      reconcileUserFocus(todoTable, user.id, user.name, now);
      database.set('todoTable', todoTable);
      taskSay(client, target, `/me ${user.name}, you're already focused on #${n}: ${targetEntry.task.task}—${encouragement}`);
      emitUpdates();
      return;
    }

    const prevText = focusedTaskBefore.task;
    const prevElapsed = formatElapsedMs(getTaskElapsedMs(focusedTaskBefore));
    markTaskDone(focusedTaskBefore, now);
    clearUserFocusIfTask(user.id, focusedTaskBefore.id);

    switchFocusToUserOrdinal(todoTable, user.id, user.name, n, now);
    reconcileUserFocus(todoTable, user.id, user.name, now);
    database.set('todoTable', todoTable);

    taskSay(
      client,
      target,
      `/me Nice ${user.name}! ${prevText} is emmmyDone (took ${prevElapsed}). Now focused on #${n}: ${targetEntry.task.task}—${encouragement}`,
    );
    emitUpdates();
    return;
  }

  // New task text — complete explicit focus, then focus existing match or add new task
  const existingActive = getActiveUserTaskEntries(todoTable, user.name).find(
    (e) => e.task.task.toLowerCase() === raw.toLowerCase(),
  );

  if (!existingActive && currentUserTaskCount >= MAX_TASKS_PER_DAY) {
    taskSay(client, target, MAX_TASKS_PER_DAY_MESSAGE);
    return;
  }

  let prevText = null;
  let prevElapsed = null;
  if (focusedTaskBefore) {
    prevText = focusedTaskBefore.task;
    prevElapsed = formatElapsedMs(getTaskElapsedMs(focusedTaskBefore));
    markTaskDone(focusedTaskBefore, now);
    clearUserFocusIfTask(user.id, focusedTaskBefore.id);
  }

  if (existingActive) {
    switchFocusToUserOrdinal(todoTable, user.id, user.name, existingActive.userOrdinal, now);
    reconcileUserFocus(todoTable, user.id, user.name, now);
    database.set('todoTable', todoTable);

    if (prevText) {
      const totalDoneToday = todoTable.tasks.filter((t) => t.username === user.name && t.done).length;
      taskSay(
        client,
        target,
        `/me Nice ${user.name}! ${prevText} is emmmyDone (took ${prevElapsed}). That's ${totalDoneToday} today—now focused on #${existingActive.userOrdinal}: ${existingActive.task.task}. ${encouragement}`,
      );
    } else {
      taskSay(
        client,
        target,
        `/me ${user.name}, you didn't have a task going but now focused on #${existingActive.userOrdinal}: ${existingActive.task.task}—${encouragement}`,
      );
    }
    emitUpdates();
    return;
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

  const newEntry = getUserTaskEntries(todoTable, user.name).find((e) => e.task.id === newRow.id);
  switchFocusToUserOrdinal(todoTable, user.id, user.name, newEntry.userOrdinal, now);
  reconcileUserFocus(todoTable, user.id, user.name, now);
  database.set('todoTable', todoTable);

  if (prevText) {
    const totalDoneToday = todoTable.tasks.filter((t) => t.username === user.name && t.done).length;
    taskSay(
      client,
      target,
      `/me Nice ${user.name}! ${prevText} is emmmyDone (took ${prevElapsed}). That's ${totalDoneToday} today—now focused on #${newEntry.userOrdinal}: ${raw}. ${encouragement}`,
    );
  } else {
    taskSay(
      client,
      target,
      `/me ${user.name}, you didn't have a task going but now focused on #${newEntry.userOrdinal}: ${raw}—${encouragement}`,
    );
  }
  emitUpdates();
};
