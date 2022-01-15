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
    client.say(target, `What is your task?`);
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
  const encouragementList = ['Good luck!', 'You got this!', 'Get that bread!', 'Focus up!'];
  const encouragement = encouragementList[Math.floor(Math.random() * encouragementList.length)];

  // print result
  client.say(target, `Task added, ${user.name}. ${encouragement}`);
}


// todoTable = {
//   day: '1/14/2021',
//   tasks: [{
//     username: 'razzyrl',
//     task: 'play rocket league',
//     done: true,
//   }, {
//     ...
//   }]
// }




// todoTable = {} 