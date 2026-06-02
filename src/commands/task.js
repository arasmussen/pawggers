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
  splitTaskTitles,
  findLastUserTaskGlobalIndex,
  getFocusedTaskId,
  setFocusedTaskId,
  getUserTaskEntries,
  reconcileUserFocus,
  getTaskElapsedMs,
  formatElapsedMs,
  taskSay,
} = require('../tasks/taskUtils');
const MAX_TASK_NAME_CHARS = 200;

function emitTaskViews() {
  SocketServer.emit('update-task-view', generateTaskBody());
  SocketServer.emit('update-decoy-task-view', generateDecoyTaskBody());
  SocketServer.emit('update-live-stream-stats', generateLiveStreamStatsBody());
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

  function scrollOverlayToUser() {
    SocketServer.emit('scroll-live-stream-stats-to-user', { username: user.name });
  }

  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  const rawInput = context.variables.join(' ').trim();
  const todoTable = setupTaskTable();

  if (rawInput === '') {
    reconcileUserFocus(todoTable, user.id, user.name);
    const focusId = getFocusedTaskId(user.id);
    const focusedTask = focusId
      ? todoTable.tasks.find((t) => t.id === focusId && t.username === user.name && !t.done)
      : null;
    if (focusedTask) {
      const entry = getUserTaskEntries(todoTable, user.name).find((e) => e.task.id === focusedTask.id);
      const ord = entry ? entry.userOrdinal : '?';
      const elapsed = formatElapsedMs(getTaskElapsedMs(focusedTask));
      taskSay(client, target, `${user.name}, you're working on #${ord}: ${focusedTask.task} (${elapsed})`);
    } else {
      taskSay(client, target, `You don't have an active task. Use !task [task name] to start one.`);
    }
    scrollOverlayToUser();
    return;
  }

  const titles = splitTaskTitles(rawInput);
  for (const t of titles) {
    if (t.length > MAX_TASK_NAME_CHARS) {
      taskSay(client, target, 'Shorten your task name please!');
      return;
    }
  }

  const currentUserTaskCount = todoTable.tasks.filter((t) => t.username === user.name).length;
  if (currentUserTaskCount + titles.length > MAX_TASKS_PER_DAY) {
    taskSay(client, target, MAX_TASKS_PER_DAY_MESSAGE);
    return;
  }

  const focusIdBefore = getFocusedTaskId(user.id);
  const hadValidFocus = Boolean(
    focusIdBefore &&
      todoTable.tasks.some(
        (t) => t.id === focusIdBefore && t.username === user.name && !t.done,
      ),
  );

  const insertAfter = findLastUserTaskGlobalIndex(todoTable, user.name);
  const now = Date.now();
  const newIds = [];
  let insertIdx = insertAfter === -1 ? todoTable.tasks.length : insertAfter + 1;

  titles.forEach((title) => {
    const row = {
      id: newTaskId(),
      userId: user.id,
      username: user.name,
      task: title,
      done: false,
      created: now,
      accumulatedMs: 0,
      focusStartedAt: null,
    };
    newIds.push(row.id);
    todoTable.tasks.splice(insertIdx, 0, row);
    insertIdx += 1;
  });

  if (!hadValidFocus && titles.length > 0) {
    setFocusedTaskId(user.id, newIds[0]);
  }

  reconcileUserFocus(todoTable, user.id, user.name);
  database.set('todoTable', todoTable);

  const encouragementList = ['Good luck!', 'You got this!', 'Get that bread!', 'Focus up!', 'We believe in you!'];
  const encouragement = encouragementList[Math.floor(Math.random() * encouragementList.length)];
  const firstNewEntry = getUserTaskEntries(todoTable, user.name).find((e) => newIds.includes(e.task.id));
  const firstOrd = firstNewEntry ? firstNewEntry.userOrdinal : null;
  let msg;
  if (titles.length === 1) {
    msg = firstOrd != null
      ? `Task #${firstOrd} added, ${user.name}. ${encouragement}`
      : `Task added, ${user.name}. ${encouragement}`;
  } else {
    const ordinals = newIds
      .map((id) => getUserTaskEntries(todoTable, user.name).find((e) => e.task.id === id))
      .filter(Boolean)
      .map((e) => e.userOrdinal);
    const ordList = ordinals.length > 0 ? ` (#${ordinals.join(', #')})` : '';
    msg = `${titles.length} tasks added${ordList}, ${user.name}. ${encouragement}`;
  }
  taskSay(client, target, msg);

  emitTaskViews();
};
