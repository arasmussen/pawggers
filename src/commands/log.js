const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const setupTaskTable = require('../tasks/setupTaskTable');
const socket = require('../managers/socket');

const MAX_TASKS_PER_DAY = 99;
const MAX_TASK_NAME_CHARS_TOTAL = 200;

module.exports = function(context) {
  const { client, target } = context;
  if (!context?.['display-name'] || !context?.['user-id']) return;

  const user = { id: context['user-id'], name: context['display-name'] };
  let userTable = database.get('userTable') || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  const tasks = context.variables.join(' ').trim().split(/\s*;\s*/).map((t) => t.trim()).filter(Boolean);
  if (!tasks.length) {
    client.say(target, 'Which tasks would you like me to log?');
    return;
  }

  const totalTaskChars = tasks.reduce((sum, t) => sum + t.length, 0);
  if (totalTaskChars > MAX_TASK_NAME_CHARS_TOTAL) {
    client.say(target, `All tasks in one log can't be over ${MAX_TASK_NAME_CHARS_TOTAL} characters.`);
    return;
  }

  const todoTable = setupTaskTable();
  const currentUserTaskCount = todoTable.tasks.filter((t) => t.username === user.name).length;
  if (currentUserTaskCount + tasks.length > MAX_TASKS_PER_DAY) {
    client.say(target, 'This puts your task count over 99 for the day. Stop trying to break me!');
    return;
  }
  const now = Date.now();
  let firstActiveIndex = -1;
  let lastUserIndex = -1;

  todoTable.tasks.forEach((task, i) => {
    if (task.username !== user.name) return;
    lastUserIndex = i;
    if (!task.done && firstActiveIndex === -1) firstActiveIndex = i;
  });

  const insertIndex = firstActiveIndex !== -1 ? firstActiveIndex : lastUserIndex + 1;
  const newTasks = tasks.map((task) => ({
    username: user.name,
    task,
    done: true,
    created: now,
    doneAt: now,
  }));

  todoTable.tasks.splice(insertIndex, 0, ...newTasks);
  database.set('todoTable', todoTable);
  
  const CELEBRATIONS = ['good job!', 'good stuff!', 'amazing!', 'you\'re killing it!', 'keep it up!', 'heck yeah!', 'hypeeeee!', 'let\'s goooo!', 'proud of you!'];
  const celebration = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
  const msg = tasks.length === 1
    ? `${user.name}, I've logged that task for you—${celebration}`
    : `${user.name}, I've logged those ${tasks.length} tasks for you—${celebration}`;
  client.say(target, msg);

  socket.emit('update-task-view', generateTaskBody());
};
