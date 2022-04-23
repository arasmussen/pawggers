const { ClientRequest } = require('http');
const database = require('../database');
const getPeriod = require('../util/getPeriod');
const isSarah = require('../util/isSarah');
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

  // upsert user
  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  // return if not sarah
  if (!isSarah(user.id)) {
    client.say(target, `Nice try, ${user.name}`);
    return;
  }

  // update databases
  let statsTable = database.get('statsTable') || {
    completedTaskRecord: 0,
  };
  database.set('statsTable', statsTable);

  // find total completed tasks
  const todoTable = setupTaskTable();
  const totalCompletedTasks = todoTable.tasks.filter((task) => {
    return task.done;
  }).length;

  // find people who completed at least 3 tasks
  const tasksForUser = {};
  todoTable.tasks.forEach((task) => {
    tasksForUser[task.username] = tasksForUser[task.username] || [];
    tasksForUser[task.username].push(task);
  });
  const taskUsernames = Object.keys(tasksForUser);
  const usernamesWithThreeTasks = taskUsernames.filter((username) => {
    return tasksForUser[username].length >= 3;
  });

  // translate usernames to IDs
  const usernameToUser = {};
  Object.keys(userTable).forEach((userID) => {
    const user = userTable[userID];
    usernameToUser[user.name] = user;
  });

  const userIDsWithThreeTasks = usernamesWithThreeTasks.map((username) => {
    return usernameToUser[username].id;
  });

  // get period
  const period = getPeriod();

  // give pawggers to people who complete at least 3 tasks
  userIDsWithThreeTasks.forEach((userID) => {
    let userSpendTable = database.get('userSpendTable');
    userSpendTable = userSpendTable || {};
    userSpendTable[period] = userSpendTable[period] || {};
    userSpendTable[period][userID] = userSpendTable[period][userID] || {};
    userSpendTable[period][userID].spend = userSpendTable[period][userID].spend || 0;
    userSpendTable[period][userID].spend += 2000;
    database.set('userSpendTable', userSpendTable);
  });

  // print results
  client.say(target, `We've finished our poms for the day. Good job gang!`);

  // update if record broken
  if (totalCompletedTasks > statsTable.completedTaskRecord) {
    statsTable.completedTaskRecord = totalCompletedTasks;
    client.say(target, `We've set a new daily completed tasks RECORD of ${totalCompletedTasks}!`);
    database.set('statsTable', statsTable);
  }

  client.say(target, `${userIDsWithThreeTasks.length} people completed 3 or more tasks today! They have each earned 2,000 pawggers emmmyPawg`)
}

