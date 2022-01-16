const { ClientRequest } = require('http');
const { client } = require('tmi.js');
const database = require('../database');
const getDay = require('../util/getDay');
const isMod = require('../util/isMod');

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

  const userIsMentioned = context.variables.length === 1 && context.variables[0][0] === '@';

  // remove all tasks if mod is removing for user (in case TOS), else remove active task for author
  if (isMod(user.id) && userIsMentioned) {
    const atUsername = context.variables[0].replace(/^@/, '');

    todoTable.tasks = todoTable.tasks.filter((task) => {
      return task.username !== atUsername;
    });
    database.set('todoTable', todoTable);

    client.say(target, `Removed all tasks from @${atUsername}`);
    
  } else {

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

    const index = todoTable.tasks.indexOf(activeTaskForUser);
    if (index > -1) {
      todoTable.tasks.splice(index, 1);
    }
    database.set('todoTable', todoTable);

    // print result
    client.say(target, `Task removed, ${user.name}.`);
  };
}