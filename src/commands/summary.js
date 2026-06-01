const database = require('../database');
const setupTaskTable = require('../tasks/setupTaskTable');
const {
  getFocusedTaskId,
  getUserTaskEntries,
  getTaskElapsedMs,
  formatElapsedMs,
  formatActiveTaskList,
  reconcileUserFocus,
  taskSay,
} = require('../tasks/taskUtils');

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

  const entries = getUserTaskEntries(todoTable, user.name);
  if (entries.length === 0) {
    taskSay(client, target, `You haven't done any tasks yet today. Use !task to get on the board!`);
    return;
  }

  const completedTasksForUser = entries
    .filter((e) => e.task.done)
    .map((e) => e.task)
    .sort((a, b) => (a.doneAt || 0) - (b.doneAt || 0));
  const activeEntries = entries.filter((e) => !e.task.done);
  const focusId = getFocusedTaskId(user.id);
  const focusedActive = focusId
    ? activeEntries.find((e) => e.task.id === focusId)
    : null;

  let completedTaskNames = '';
  for (let i = 0; i < completedTasksForUser.length; i++) {
    if (i === completedTasksForUser.length - 1 && completedTasksForUser.length > 1) {
      completedTaskNames += 'and ';
    }
    const t = completedTasksForUser[i];
    const elapsedMs = getTaskElapsedMs(t);
    const elapsedStr = elapsedMs > 0 ? ` (${formatElapsedMs(elapsedMs)})` : '';
    completedTaskNames += `${t.task}${elapsedStr}`;
    if (i < completedTasksForUser.length - 1) {
      completedTaskNames += ', ';
    } else {
      completedTaskNames += '.';
    }
  }

  if (entries.length === 1 && focusedActive) {
    const activeList = formatActiveTaskList([focusedActive], focusId, { includeElapsed: true });
    taskSay(client, target, `${user.name}, you're still working on: ${activeList}`);
    return;
  }

  if (activeEntries.length === 0) {
    taskSay(
      client,
      target,
      `${user.name}, you've completed ${completedTasksForUser.length} ${completedTasksForUser.length === 1 ? 'task' : 'tasks'} today: ${completedTaskNames}`,
    );
    return;
  }

  const activeList = formatActiveTaskList(activeEntries, focusId, { includeElapsed: true });

  if (completedTasksForUser.length === 0) {
    taskSay(client, target, `${user.name}, you haven't finished any of your tasks. !focus [task number] to start it`);
    return;
  }

  taskSay(
    client,
    target,
    `${user.name}, you've completed ${completedTasksForUser.length} ${completedTasksForUser.length === 1 ? 'task' : 'tasks'} today: ${completedTaskNames} Still working on: ${activeList}`,
  );
};
