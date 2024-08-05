const { ClientRequest } = require('http');
const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const SocketServer = require('../managers/socket');
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

  // add user to table
  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);
  
  // get task
  const task = context.variables.join(' ').trim();

  // if they didn't type a task
  if (task === '') {
    client.say(target, `/me What's your next task?`);
    return;
  }

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

  // random encouragement
  const encouragementList = ['Good luck!', 'You got this!', 'Get that bread!', 'Focus up!', 'We believe in you!'];
  const encouragement = encouragementList[Math.floor(Math.random() * encouragementList.length)];

  // number of tasks complete
  const totalCompletedTasks = tasksForUser.length;

  // ANDREW: What if active task does not exist??
  if (!activeTaskForUser) {
    client.say(target, `/me ${user.name}, you didn't have a task going but I've added that one. ${encouragement}`);
  } else {
    // complete the existing task
    client.say(target, `/me Nice ${user.name}! ${activeTaskForUser.task} is done. That's ${totalCompletedTasks} today—on to the next one. ${encouragement}`);
    activeTaskForUser.done = true;
  }

  // add new task to list
  const newTask = {
    username: user.name,
    task: task,
    done: false,
  };
  todoTable.tasks.push(newTask);
  database.set('todoTable', todoTable);

  // update socket clients
  SocketServer.emit('update-task-view', generateTaskBody());
}
