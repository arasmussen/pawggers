const { ClientRequest } = require('http');
const { client } = require('tmi.js');
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
  if (task === '') {
    client.say(target, `What is your task?`);
    return;
  }
  
  // setup database table
  const todoTable = setupTaskTable();

  // find tasks for user
  const tasksForUser = todoTable.tasks.filter((task) => {
    return user.name === task.username;
  });

  // handle if active task exists
  const userHasActiveTask = tasksForUser.some((task) => {
    return !task.done;
  });

  if (userHasActiveTask) {
    client.say(target, `${user.name}, you already have an active task.`);
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
