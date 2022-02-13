const { ClientRequest } = require('http');
const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
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

  // setup database table
  const todoTable = setupTaskTable();

  // find tasks for user
  const tasksForUser = todoTable.tasks.filter((task) => {
    return user.name === task.username;
  });

  // find completed tasks for user
  const completedTasksForUser = todoTable.tasks.filter((task) => {
    return user.name === task.username && task.done;
  });

  // if active task exists
  const activeTaskForUser = tasksForUser.find((task) => {
    return !task.done;
  });

  // make list of completed task names
  let completedTaskNames = '';
  for (let i = 0; i < completedTasksForUser.length; i++) {
    if (i === completedTasksForUser.length - 1 && completedTasksForUser.length > 1) {
      completedTaskNames += 'and ';
    }
    completedTaskNames += completedTasksForUser[i].task;
    if (i < completedTasksForUser.length - 1) {
      completedTaskNames += ', ';
    } else {
      completedTaskNames += '.';
    }
  }

  if (tasksForUser.length === 0) {
    client.say(target, `You haven't done any tasks yet today. Use !task to get on the board!`);
    return;
  } else if (tasksForUser.length === 1 && activeTaskForUser) {
    client.say(target, `${user.name}, you're still working on: ${activeTaskForUser.task}.`);
    return;
  } else if (activeTaskForUser) {
    client.say(target, `${user.name}, you've completed ${completedTasksForUser.length} ${completedTasksForUser.length === 1 ? 'task' : 'tasks'} today: ${completedTaskNames} You're still working on: ${activeTaskForUser.task}.`);
    return;
  } else {
    client.say(target, `${user.name}, you've completed ${completedTasksForUser.length} ${completedTasksForUser.length === 1 ? 'task' : 'tasks'} today: ${completedTaskNames}`);
    return;
  }
}
