const { ClientRequest } = require('http');
const { client } = require('tmi.js');
const database = require('../database');
const getDay = require('../util/getDay');

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
    client.say(target, `What do you want to change your task to?`);
    return;
  }
  
  // clear list if out of date
  const today = getDay();
  let todoTable = database.get('todoTable');
  todoTable = todoTable || {
    day: today,
    tasks: [],
  };

  if (todoTable.day) {
    if (todoTable.day !== today) {
      todoTable = {
        day: today,
        tasks: [],
      };
    }
  }
  database.set('todoTable', todoTable);

  // find tasks for user
  const tasksForUser = todoTable.tasks.filter((task) => {
    return user.name === task.username;
  });

  // if all tasks are done
  const userHasAllDoneTasks = tasksForUser.every((task) => {
    return task.done;
  });

  if (userHasAllDoneTasks) {
    client.say(target, `${user.name}, you don't have any active tasks.`);
    return;
  }

  // edit if active task exists
  const activeTaskForUser = tasksForUser.find((task) => {
    return !task.done;
  });

  activeTaskForUser.task = task;
  database.set('todoTable', todoTable);

  // print result
  client.say(target, `${user.name}, I've edited your task to: ${task}`);
}