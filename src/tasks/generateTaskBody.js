const escapeHTML = require('../util/escapeHTML');
const getDay = require('../util/getDay');
const setupTaskTable = require('./setupTaskTable');

function generateTaskBody() {
  // setup database
  const todoTable = setupTaskTable();

  const tasksDone = todoTable.tasks.filter((task) => {
    return task.done;
  }).length;

  const itemLength = todoTable.tasks.filter((task) => {
    return
  });

  const totalTasks = todoTable.tasks.length;

  // generate body
  const body = todoTable.tasks.map((task) => {
    const itemLength = task.username.length + task.task.length + 1;
    let truncatedTask = task.task;
    if (itemLength >= 36) {
      truncatedTask = task.task.substr(0, 36 - task.username.length - 1) + '…';
    }
    return `<li>${task.done ? '<div class="box checked"><div class="check"></div></div>' : '<div class="box"></div>'} <div><span class="username">${escapeHTML(task.username)}</span> ${escapeHTML(truncatedTask)}</div></li>`;
  }).join('');

  return `<div class="tasksDone">!TASKS ${tasksDone}/${totalTasks}</div><div id="scrollContainer"><ul>${body}</ul></div>`;
}

module.exports = generateTaskBody;