const database = require('../database');
const getDay = require('../util/getDay');
const lockInTaskStats = require('./lockInTaskStats');

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
  }
  database.set('todoTable', todoTable);

  return todoTable;
}

module.exports = setupTaskTable;