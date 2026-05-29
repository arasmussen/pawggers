const database = require('../database');
const generateTaskBody = require('../tasks/generateTaskBody');
const generateDecoyTaskBody = require('../tasks/generateDecoyTaskBody');
const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const setupTaskTable = require('../tasks/setupTaskTable');
const socket = require('../managers/socket');
const {
  getFocusedTaskId,
  setFocusedTaskId,
  getUserTaskEntries,
  getUserTaskEntryByOrdinal,
  getActiveUserTaskEntries,
  parseTaskNumberList,
  markTaskDone,
  clearUserFocusIfTask,
  pauseAllUserTaskTimers,
  reconcileUserFocus,
  getTaskElapsedMs,
  formatElapsedMs,
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
  const arg = context.variables.join(' ').trim().toLowerCase();
  const now = Date.now();

  const entries = getUserTaskEntries(todoTable, user.name);
  const activeEntries = getActiveUserTaskEntries(todoTable, user.name);

  if (activeEntries.length === 0) {
    client.say(target, `${user.name}, you don't have a task atm. !task to start one or !focus [number] a task on your list`);
    return;
  }

  const toComplete = [];

  if (arg === '') {
    reconcileUserFocus(todoTable, user.id, user.name, now);
    const fid = getFocusedTaskId(user.id);
    let t = fid ? todoTable.tasks.find((x) => x.id === fid && x.username === user.name && !x.done) : null;
    if (!t) {
      t = activeEntries[0].task;
    }
    toComplete.push(t);
  } else if (arg === 'all') {
    pauseAllUserTaskTimers(todoTable, user.name, now);
    activeEntries.forEach((e) => toComplete.push(e.task));
    setFocusedTaskId(user.id, null);
  } else {
    const numsRaw = parseTaskNumberList(context.variables.join(' '));
    const seen = new Set();
    const nums = [];
    numsRaw.forEach((n) => {
      if (!seen.has(n)) {
        seen.add(n);
        nums.push(n);
      }
    });
    if (nums.length === 0) {
      client.say(target, `${user.name}, use !done, !done all, or !done 1,2,3 with task numbers`);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      const n = nums[i];
      const entry = getUserTaskEntryByOrdinal(todoTable, user.name, n);
      if (!entry) {
        client.say(target, `${user.name}, there is no task #${n}`);
        return;
      }
      if (entry.task.done) {
        client.say(target, `${user.name}, task #${n} is already done`);
        return;
      }
      toComplete.push(entry.task);
    }
  }

  const focusId = getFocusedTaskId(user.id);
  toComplete.forEach((task) => {
    markTaskDone(task, now);
    if (task.id === focusId) {
      clearUserFocusIfTask(user.id, task.id);
    }
  });

  reconcileUserFocus(todoTable, user.id, user.name, now);
  database.set('todoTable', todoTable);

  const celebrationList = [
    'good job!', 'good stuff!', 'amazing!', "you're killing it!", 'keep it up!', 'heck yeah!', 'hypeeeee!',
    "let's goooo!", 'proud of you!',
  ];
  const celebration = celebrationList[Math.floor(Math.random() * celebrationList.length)];
  const completedToday = todoTable.tasks.filter((t) => t.username === user.name && t.done).length;

  if (toComplete.length === 1) {
    const elapsed = formatElapsedMs(getTaskElapsedMs(toComplete[0]));
    client.say(
      target,
      `emmmyDone Check check on ${toComplete[0].task}, ${user.name}. That took ${elapsed}. That's ${completedToday} today—${celebration}`,
    );
  } else {
    client.say(
      target,
      `${user.name}, emmmyDone on ${toComplete.length} tasks. That's ${completedToday} completed today—${celebration}`,
    );
  }

  socket.emit('update-task-view', generateTaskBody());
  socket.emit('update-decoy-task-view', generateDecoyTaskBody());
  socket.emit('update-live-stream-stats', generateLiveStreamStatsBody());
};
