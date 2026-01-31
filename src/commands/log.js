const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const setupTaskTable = require('../tasks/setupTaskTable');
const socket = require('../managers/socket');

module.exports = function(context) {
  const { client, target } = context;

  // data validation
  if (!context?.['display-name'] ||
      !context?.['user-id']) {
    console.log('validation failed');
    return;
  }

  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };

  // add user to table
  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  // parse tasks: separated by "; " only
  const rawInput = context.variables.join(' ').trim();
  const tasks = rawInput
    .split('; ')
    .map((t) => t.trim())
    .filter(Boolean);

  if (tasks.length === 0) {
    client.say(target, 'Which tasks would you like me to log?');
    return;
  }

  const todoTable = setupTaskTable();

  // find insertion index: after this user's last completed task, before any current task
  const now = Date.now();
  const userTaskIndices = [];
  let firstActiveIndex = -1;

  todoTable.tasks.forEach((task, i) => {
    if (task.username !== user.name) return;
    userTaskIndices.push(i);
    if (!task.done && firstActiveIndex === -1) {
      firstActiveIndex = i;
    }
  });

  let insertIndex;
  if (firstActiveIndex !== -1) {
    insertIndex = firstActiveIndex;
  } else if (userTaskIndices.length > 0) {
    insertIndex = userTaskIndices[userTaskIndices.length - 1] + 1;
  } else {
    insertIndex = todoTable.tasks.length;
  }

  const newTasks = tasks.map((taskText) => ({
    username: user.name,
    task: taskText,
    done: true,
    created: now,
    doneAt: now,
  }));

  todoTable.tasks.splice(insertIndex, 0, ...newTasks);
  database.set('todoTable', todoTable);

  const count = tasks.length;
  const celebrationList = ['good job!', 'good stuff!', 'amazing!', 'you\'re killing it!', 'keep it up!', 'heck yeah!', 'hypeeeee!', 'let\'s goooo!', 'proud of you!'];
  const celebration = celebrationList[Math.floor(Math.random() * celebrationList.length)];

  if (count === 1) {
    client.say(target, `${user.name}, I've logged that task for you—${celebration}`);
  } else {
    client.say(target, `${user.name}, I've logged those ${count} tasks for you—${celebration}`);
  }

  socket.emit('update-task-view', generateTaskBody());
};
