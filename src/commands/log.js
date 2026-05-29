const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const generateDecoyTaskBody = require('../tasks/generateDecoyTaskBody');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const setupTaskTable = require('../tasks/setupTaskTable');
const socket = require('../managers/socket');
const {
  MAX_TASKS_PER_DAY,
  MAX_TASKS_PER_DAY_MESSAGE,
  newTaskId,
  findLastUserTaskGlobalIndex,
  splitTaskTitles,
  taskSay,
} = require('../tasks/taskUtils');
const MAX_TASK_NAME_CHARS_TOTAL = 200;

module.exports = function(context) {
  const { client, target } = context;
  if (!context?.['display-name'] || !context?.['user-id']) return;

  const user = { id: context['user-id'], name: context['display-name'] };
  let userTable = database.get('userTable') || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  const tasks = splitTaskTitles(context.variables.join(' ').trim());
  if (!tasks.length) {
    taskSay(client, target, 'Which tasks would you like me to log?');
    return;
  }

  const totalTaskChars = tasks.reduce((sum, t) => sum + t.length, 0);
  if (totalTaskChars > MAX_TASK_NAME_CHARS_TOTAL) {
    taskSay(client, target, `All tasks in one log can't be over ${MAX_TASK_NAME_CHARS_TOTAL} characters`);
    return;
  }

  const todoTable = setupTaskTable();
  const currentUserTaskCount = todoTable.tasks.filter((t) => t.username === user.name).length;
  if (currentUserTaskCount + tasks.length > MAX_TASKS_PER_DAY) {
    taskSay(client, target, MAX_TASKS_PER_DAY_MESSAGE);
    return;
  }

  const now = Date.now();
  const insertAfter = findLastUserTaskGlobalIndex(todoTable, user.name);
  let insertIdx = insertAfter === -1 ? todoTable.tasks.length : insertAfter + 1;

  tasks.forEach((taskTitle) => {
    const row = {
      id: newTaskId(),
      userId: user.id,
      username: user.name,
      task: taskTitle,
      done: true,
      created: now,
      doneAt: now,
      accumulatedMs: 0,
      focusStartedAt: null,
    };
    todoTable.tasks.splice(insertIdx, 0, row);
    insertIdx += 1;
  });

  database.set('todoTable', todoTable);

  const CELEBRATIONS = [
    'good job!', 'good stuff!', 'amazing!', "you're killing it!", 'keep it up!', 'heck yeah!', 'hypeeeee!',
    "let's goooo!", 'proud of you!',
  ];
  const celebration = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
  const msg =
    tasks.length === 1
      ? `${user.name}, I've logged that task for you—${celebration}`
      : `${user.name}, I've logged those ${tasks.length} tasks for you—${celebration}`;
  taskSay(client, target, msg);

  socket.emit('update-task-view', generateTaskBody());
  socket.emit('update-decoy-task-view', generateDecoyTaskBody());
  socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
};
