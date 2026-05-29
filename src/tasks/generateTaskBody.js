const escapeHTML = require('../util/escapeHTML');
const database = require('../database');
const setupTaskTable = require('./setupTaskTable');
const { getTaskElapsedMs, formatElapsedMs } = require('./taskUtils');

function slugifyDomIdPart(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateTaskBody(options = {}) {
  const liveStreamStats = Boolean(options.liveStreamStats);
  // setup database
  const todoTable = setupTaskTable();

  const tasksDone = todoTable.tasks.filter((task) => {
    return task.done;
  }).length;

  const totalTasks = todoTable.tasks.length;

  const focusMap = database.get('taskFocus') || {};
  const userTable = database.get('userTable') || {};
  const usernameToFocusId = {};
  Object.keys(userTable).forEach((uid) => {
    const u = userTable[uid];
    if (u && u.name && focusMap[uid]) {
      usernameToFocusId[u.name] = focusMap[uid];
    }
  });

  // group by user
  const byUser = todoTable.tasks.reduce((acc, task) => {
    acc[task.username] = acc[task.username] || [];
    acc[task.username].push(task);
    return acc;
  }, {});

  // generate body
  let body = '';
  for (const [username, tasks] of Object.entries(byUser)) {
    const userAnchorId = `user-${slugifyDomIdPart(username) || 'unknown'}`;
    body += `<div class="username" id="${userAnchorId}">${escapeHTML(username)}</div><ul>`;
    tasks.forEach((task, i) => {
      // truncate if too long
      let text = task.task;
      if (task.task.length >= 80) {
        text = text.substr(0, 79) + '…';
      }
      const focusId = (task.userId && focusMap[task.userId]) || usernameToFocusId[username];
      const isFocused = !task.done && focusId && task.id === focusId;
      let taskClass = task.done ? 'task completed' : 'task';
      if (isFocused) taskClass += ' task--focused';
      const taskNumber = String(i + 1).padStart(2, '0');
      const elapsedMs = getTaskElapsedMs(task);
      const elapsedStr = elapsedMs > 0 ? ` ${formatElapsedMs(elapsedMs)}` : '';
      body += `<li><span class="taskNumber">${taskNumber}</span> <span class="${taskClass}"><span class="taskName">${escapeHTML(text)}</span><span class="elapsed">${elapsedStr}</span></span></li>`;
    });
    body += `</ul>`;
  }

  if (liveStreamStats) {
    return `<div class="tasksStreamHeader"><div class="sectionTitle">TASKS</div><div class="tasksCounter">${tasksDone}/${totalTasks}</div></div><div id="scrollContainer" class="scrollContainer--topTaskFade"><ul>${body}</ul></div>`;
  }
  return `<div class="tasksDone"> TASKS<div class="tasksCounter">${tasksDone}/${totalTasks}</div></div><div id="scrollContainer"><ul>${body}</ul></div>`;
}

module.exports = generateTaskBody;