const database = require('../database');
const setupTaskTable = require('../tasks/setupTaskTable');
const {
  getFocusedTaskId,
  getUserTaskEntries,
  getTaskElapsedMs,
  formatElapsedMs,
  reconcileUserFocus,
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
    client.say(target, `You haven't done any tasks yet today. Use !task to get on the board!`);
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
    const elapsed = formatElapsedMs(getTaskElapsedMs(focusedActive.task));
    client.say(target, `${user.name}, you're still working on: ${focusedActive.task.task} (${elapsed})`);
    return;
  }

  if (activeEntries.length === 0) {
    client.say(
      target,
      `${user.name}, you've completed ${completedTasksForUser.length} ${completedTasksForUser.length === 1 ? 'task' : 'tasks'} today: ${completedTaskNames}`,
    );
    return;
  }

  const activeList = activeEntries
    .map((e) => {
      const elapsed = formatElapsedMs(getTaskElapsedMs(e.task));
      const star = focusedActive && e.task.id === focusedActive.task.id ? ' (focused)' : '';
      return `#${e.userOrdinal}: ${e.task.task} (${elapsed})${star}`;
    })
    .join(' | ');

  if (completedTasksForUser.length === 0) {
    client.say(target, `${user.name}, you haven't finished any of your tasks. !focus [task number] to start it`);
    return;
  }

  client.say(
    target,
    `${user.name}, you've completed ${completedTasksForUser.length} ${completedTasksForUser.length === 1 ? 'task' : 'tasks'} today: ${completedTaskNames} Still working on: ${activeList}`,
  );
};
