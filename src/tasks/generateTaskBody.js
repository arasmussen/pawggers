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
    tasks.forEach(task => {
      // truncate if too long
      let text = task.task;
      if (task.task.length >= 40) {
        text = text.substr(0, 39) + '…';
      }
      body += `<li>${
        task.done
          ? '<div class="box checked"><div class="check"></div></div>'
          : '<div class="box"></div>'
      } <div><span class="task">${escapeHTML(text)}</span></div></li>`;
    });
    body += `</ul>`;
  }

  return `<div class="tasksDone"> TASKS<div class="tasksCounter">${tasksDone}/${totalTasks}</div></div><div id="scrollContainer"><ul>${body}</ul></div>`;
}

module.exports = generateTaskBody;