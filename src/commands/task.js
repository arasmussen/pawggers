const { ClientRequest } = require('http');
const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const getElapsed = require('../util/getElapsed');
const SocketServer = require('../managers/socket');
const setupTaskTable = require('../tasks/setupTaskTable');

const MAX_TASKS_PER_DAY = 99;
const MAX_TASK_NAME_CHARS = 200;

module.exports = function(context) {
  const { client, target } = context;

  // data validation
  if (!context?.['display-name'] ||
      !context?.['user-id']) {
    console.log('validation failed');
    return;
  }

  // get user
  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };

  // add user to table
  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);
  
  // get task
  const task = context.variables.join(' ').trim();
  
  // setup database table
  const todoTable = setupTaskTable();

  if (task.length > MAX_TASK_NAME_CHARS) {
    client.say(target, `Shorten your task name please!`);
    return;
  }

  const currentUserTaskCount = todoTable.tasks.filter((t) => t.username === user.name).length;
  if (currentUserTaskCount >= MAX_TASKS_PER_DAY) {
    client.say(target, 'This puts your task count over 99 for the day. Stop trying to break me!');
    return;
  }

  // find tasks for user
  const tasksForUser = todoTable.tasks.filter((task) => {
    return user.name === task.username;
  });

  // handle if active task exists
  const activeTaskForUser = tasksForUser.find((task) => {
    return !task.done;
  });

  if (task === '' && !activeTaskForUser) {
    client.say(target, `You don't have an active task. Use !task [task name] to start one.`);
    return;
  }

  if (activeTaskForUser) {
    const elapsed = getElapsed(activeTaskForUser.created);
    client.say(target, `${user.name}, you're working on: ${activeTaskForUser.task} (${elapsed})`);
    return;
  }

  // add task to list
  const newTask = {
    userId: user.id,
    username: user.name,
    task: task,
    done: false,
    created: Date.now(),
  };
  todoTable.tasks.push(newTask);
  database.set('todoTable', todoTable);

  // random encouragement
  const encouragementList = ['Good luck!', 'You got this!', 'Get that bread!', 'Focus up!', 'We believe in you!'];
  const encouragement = encouragementList[Math.floor(Math.random() * encouragementList.length)];

  // print result
  client.say(target, `Task added, ${user.name}. ${encouragement}`);

  // update socket clients
  SocketServer.emit('update-task-view', generateTaskBody());
}
