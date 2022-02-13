const { ClientRequest } = require('http');
const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const socket = require('../managers/socket');
const setupTaskTable = require('../tasks/setupTaskTable');

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
  
  // get task
  const task = context.variables.join(' ').trim();
  
  // setup database table
  const todoTable = setupTaskTable();

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
    client.say(target, `${user.name}, you're working on LOCAL: ${activeTaskForUser.task}`);
    return;
  }

  // add task to list
  const newTask = {
    username: user.name,
    task: task,
    done: false,
  };
  todoTable.tasks.push(newTask);
  database.set('todoTable', todoTable);

  // random encouragement
  const encouragementList = ['Good luck!', 'You got this!', 'Get that bread!', 'Focus up!', 'We believe in you!'];
  const encouragement = encouragementList[Math.floor(Math.random() * encouragementList.length)];

  // print result
  client.say(target, `Task added, ${user.name}. ${encouragement}`);

  // update socket clients
  socket.emit('update-task-view', generateTaskBody());
}
