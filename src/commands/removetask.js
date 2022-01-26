const { ClientRequest } = require('http');
const database = require('../database');
const isMod = require('../util/isMod');
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

  // get user
  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };
  
  // setup database table
  const todoTable = setupTaskTable();

  const userIsMentioned = context.variables.length === 1 && context.variables[0][0] === '@';

  // remove all tasks if mod is removing for user (in case TOS), else remove active task for author
  if (userIsMentioned) {
    if (!isMod(user.id)) {
      client.say(target, 'Only mods can remove tasks by others.');
      return;
    }

    const atUsername = context.variables[0].replace(/^@/, '');
    todoTable.tasks = todoTable.tasks.filter((task) => {
      return task.username.toLowerCase() !== atUsername.toLowerCase();
    });
    database.set('todoTable', todoTable);

    client.say(target, `Removed all tasks from @${atUsername}`);

    // update socket clients
    socket.emit('update-task-view', generateTaskBody());
    return;
  }
  
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

  // handle if active task exists
  const activeTaskForUser = tasksForUser.find((task) => {
    return !task.done;
  });

  todoTable.tasks = todoTable.tasks.filter((task) => {
    return task !== activeTaskForUser;
  });
  database.set('todoTable', todoTable);

  // print result
  client.say(target, `Active task removed, ${user.name}.`);

  // update socket clients
  socket.emit('update-task-view', generateTaskBody());
}
