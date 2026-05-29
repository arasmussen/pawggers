const database = require('../database');
const getDay = require('../util/getDay');
const lockInTaskStats = require('./lockInTaskStats');
const { migrateTaskFields } = require('./taskUtils');

function setupTaskTable() {
  const today = getDay();
  let todoTable = database.get('todoTable');
  todoTable = todoTable || {
    day: today,
    tasks: [],
  };

  if (todoTable.day && todoTable.day !== today) {
    lockInTaskStats(todoTable);
    todoTable = {
      day: today,
      tasks: [],
    };
    // keep redeem queue in sync with daily task resets
    database.set('redeemQueue', []);
  }

  migrateTaskFields(todoTable);
  database.set('todoTable', todoTable);

  return todoTable;
}

module.exports = setupTaskTable;