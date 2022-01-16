const escapeHTML = require('../util/escapeHTML');
const getDay = require('../util/getDay');
const setupTaskTable = require('./setupTaskTable');

function generateTaskBody() {
  // setup database
  const todoTable = setupTaskTable();

  const tasksDone = todoTable.tasks.filter((task) => {
    return task.done;
  }).length;

  // generate body
  const body = todoTable.tasks.map((task) => {
    return `<li>${task.done ? '☑' : '☐'} ${escapeHTML(task.username)} – ${escapeHTML(task.task)}</li>`;
  }).join('');

  return `<ul>${body}</ul>${tasksDone}`;
}

module.exports = generateTaskBody;