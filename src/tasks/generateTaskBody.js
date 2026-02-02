const escapeHTML = require('../util/escapeHTML');
const getDay = require('../util/getDay');
const getElapsed = require('../util/getElapsed');
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

  // group by user
  const byUser = todoTable.tasks.reduce((acc, task) => {
    acc[task.username] = acc[task.username] || [];
    acc[task.username].push(task);
    return acc;
  }, {});

  // generate body
  let body = '';
  for (const [username, tasks] of Object.entries(byUser)) {
    body += `<div class="username">${escapeHTML(username)}</div><ul>`;
    tasks.forEach((task, i) => {
      // truncate if too long
      let text = task.task;
      if (task.task.length >= 80) {
        text = text.substr(0, 79) + '…';
      }
      const taskClass = task.done ? 'task completed' : 'task';
      const taskNumber = String(i + 1).padStart(2, '0');
      const elapsedStr = (task.done && task.created != null && task.doneAt != null && task.doneAt > task.created)
        ? ` ${getElapsed(task.created, task.doneAt)}`
        : '';
      body += `<li><span class="taskNumber">${taskNumber}</span> <span class="${taskClass}"><span class="taskName">${escapeHTML(text)}</span><span class="elapsed">${elapsedStr}</span></span></li>`;
    });
    body += `</ul>`;
  }

  return `<div class="tasksDone"> TASKS<div class="tasksCounter">${tasksDone}/${totalTasks}</div></div><div id="scrollContainer"><ul>${body}</ul></div>`;
}

module.exports = generateTaskBody;