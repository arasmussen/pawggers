const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const generateDecoyTaskBody = require('../tasks/generateDecoyTaskBody');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const setupTaskTable = require('../tasks/setupTaskTable');
const socket = require('../managers/socket');
const {
  getFocusedTaskId,
  getUserTaskEntryByOrdinal,
  reconcileUserFocus,
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

  const raw = context.variables.join(' ').trim();
  if (raw === '') {
    taskSay(client, target, `What do you want to change your task to?`);
    return;
  }

  const todoTable = setupTaskTable();
  const now = Date.now();
  reconcileUserFocus(todoTable, user.id, user.name, now);

  const editOrdinalMatch = raw.match(/^(\d+)\s+(.+)$/);
  let targetTask = null;
  if (editOrdinalMatch) {
    const ord = parseInt(editOrdinalMatch[1], 10);
    const newText = editOrdinalMatch[2].trim();
    if (newText === '' || newText.length > MAX_TASK_NAME_CHARS) {
      taskSay(client, target, newText === '' ? `What do you want to change your task to?` : `Shorten your task name please!`);
      return;
    }
    const entry = getUserTaskEntryByOrdinal(todoTable, user.name, ord);
    if (!entry || entry.task.done) {
      taskSay(client, target, `${user.name}, there is no active task #${ord} to edit`);
      return;
    }
    targetTask = entry.task;
    targetTask.task = newText;
  } else {
    const focusId = getFocusedTaskId(user.id);
    targetTask = focusId
      ? todoTable.tasks.find((t) => t.id === focusId && t.username === user.name && !t.done)
      : null;
    if (!targetTask) {
      taskSay(client, target, `${user.name}, you don't have a focused active task. Use !focus [number] or !edit [number] [new task]`);
      return;
    }
    if (raw.length > MAX_TASK_NAME_CHARS) {
      taskSay(client, target, `Shorten your task name please!`);
      return;
    }
    targetTask.task = raw;
  }

  database.set('todoTable', todoTable);

  taskSay(client, target, `${user.name}, I've edited your task to: ${targetTask.task}`);

  socket.emit('update-task-view', generateTaskBody());
  socket.emit('update-decoy-task-view', generateDecoyTaskBody());
  socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
};
