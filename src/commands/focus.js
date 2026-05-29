const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const generateDecoyTaskBody = require('../tasks/generateDecoyTaskBody');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const setupTaskTable = require('../tasks/setupTaskTable');
const socket = require('../managers/socket');
const { reconcileUserFocus, switchFocusToUserOrdinal } = require('../tasks/taskUtils');

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

  const raw = context.variables.join(' ').trim();
  if (!/^\d+$/.test(raw)) {
    client.say(target, `${user.name}, use !focus [task number] or make a new task with !task`);
    return;
  }

  const n = parseInt(raw, 10);
  const todoTable = setupTaskTable();
  const now = Date.now();

  const sw = switchFocusToUserOrdinal(todoTable, user.id, user.name, n, now);
  if (!sw.ok) {
    client.say(target, `${user.name}, ${sw.message}`);
    return;
  }

  reconcileUserFocus(todoTable, user.id, user.name, now);
  database.set('todoTable', todoTable);

  client.say(target, `${user.name}, you're now focused on task #${n}: ${sw.task.task}`);

  socket.emit('update-task-view', generateTaskBody());
  socket.emit('update-decoy-task-view', generateDecoyTaskBody());
  socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
};
