const database = require('../database');
const getDay = require('../util/getDay');

function setupTaskTable() {
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

  return todoTable;
}

module.exports = setupTaskTable;