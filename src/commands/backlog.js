const database = require('../database');
const setupTaskTable = require('../tasks/setupTaskTable');
const { getUserTaskEntries, getFocusedTaskId, reconcileUserFocus, taskSay } = require('../tasks/taskUtils');

const MAX_BACKLOG_SHOWN = 10;
const MAX_LABEL_CHARS = 60;

module.exports = function(context) {
  const { client, target } = context;

  if (!context?.['display-name'] || !context?.['user-id']) {
    console.log('validation failed');
    return;
  }

  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };

  const todoTable = setupTaskTable();
  reconcileUserFocus(todoTable, user.id, user.name);

  const incomplete = getUserTaskEntries(todoTable, user.name).filter((e) => !e.task.done);

  if (incomplete.length === 0) {
    taskSay(client, target, `${user.name}, all your tasks are done`);
    return;
  }

  const focusId = getFocusedTaskId(user.id);

  const shown = incomplete.slice(0, MAX_BACKLOG_SHOWN);
  const rest = incomplete.length - shown.length;

  const backlogList = shown.map((e) => {
    let label = e.task.task;
    if (label.length > MAX_LABEL_CHARS) {
      label = label.slice(0, MAX_LABEL_CHARS - 1) + '…';
    }
    const entry = `${e.userOrdinal}. ${label}`;
    return e.task.id === focusId ? `👉 ${entry}` : entry;
  }).join('  •  ');

  let msg = `Here's your backlog ${user.name}: ${backlogList}`;
  if (rest > 0) {
    msg += `  •  …and ${rest} more`;
  }

  taskSay(client, target, msg);
};
