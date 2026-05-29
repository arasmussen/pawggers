const database = require('../database');

const MAX_TASKS_PER_DAY = 30;
const MAX_TASKS_PER_DAY_MESSAGE = '30 is the max number of tasks per day. Go touch grass!';

function newTaskId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Split user task titles from !task / !log (commas or semicolons). */
function splitTaskTitles(input) {
  return String(input || '')
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse "3,4" / "3 4" / "3; 4" into unique positive integers. */
function parseTaskNumberList(input) {
  return String(input || '')
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function getTaskFocusMap() {
  return database.get('taskFocus') || {};
}

function setTaskFocusMap(map) {
  database.set('taskFocus', map);
}

function getFocusedTaskId(userId) {
  const m = getTaskFocusMap();
  return m[userId] || null;
}

function setFocusedTaskId(userId, taskId) {
  const m = { ...getTaskFocusMap() };
  if (taskId == null) {
    delete m[userId];
  } else {
    m[userId] = taskId;
  }
  setTaskFocusMap(m);
}

/** Per-user entries in global `todoTable.tasks` order; userOrdinal is 1-based overlay index. */
function getUserTaskEntries(todoTable, username) {
  const entries = [];
  todoTable.tasks.forEach((task, globalIndex) => {
    if (task.username !== username) return;
    entries.push({
      task,
      globalIndex,
      userOrdinal: entries.length + 1,
    });
  });
  return entries;
}

function getUserTaskEntryByOrdinal(todoTable, username, ordinal) {
  const n = parseInt(ordinal, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  const entries = getUserTaskEntries(todoTable, username);
  return entries[n - 1] || null;
}

function getActiveUserTaskEntries(todoTable, username) {
  return getUserTaskEntries(todoTable, username).filter((e) => !e.task.done);
}

function getFirstIncompleteUserOrdinal(todoTable, username) {
  const e = getUserTaskEntries(todoTable, username).find((x) => !x.task.done);
  return e ? e.userOrdinal : null;
}

function findLastUserTaskGlobalIndex(todoTable, username) {
  let last = -1;
  todoTable.tasks.forEach((t, i) => {
    if (t.username === username) last = i;
  });
  return last;
}

function pauseTaskTimer(task, now = Date.now()) {
  if (task.focusStartedAt != null) {
    const acc = Number(task.accumulatedMs) || 0;
    task.accumulatedMs = acc + Math.max(0, now - task.focusStartedAt);
    task.focusStartedAt = null;
  }
}

function startTaskTimer(task, now = Date.now()) {
  task.focusStartedAt = now;
}

function getTaskElapsedMs(task, now = Date.now()) {
  if (task.done) {
    if (task.accumulatedMs != null) return Math.max(0, Number(task.accumulatedMs) || 0);
    if (task.created != null && task.doneAt != null && task.doneAt > task.created) {
      return task.doneAt - task.created;
    }
    return 0;
  }
  let ms = Number(task.accumulatedMs) || 0;
  if (task.focusStartedAt != null) {
    ms += Math.max(0, now - task.focusStartedAt);
  }
  return Math.max(0, ms);
}

function formatElapsedMs(ms) {
  const totalMins = Math.floor(ms / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}

function finalizeTaskDuration(task, now = Date.now()) {
  pauseTaskTimer(task, now);
  return getTaskElapsedMs(task, now);
}

function markTaskDone(task, now = Date.now()) {
  finalizeTaskDuration(task, now);
  task.done = true;
  task.doneAt = now;
  task.focusStartedAt = null;
}

/** Pause timer on every task for this user (used before bulk complete). */
function pauseAllUserTaskTimers(todoTable, username, now = Date.now()) {
  getUserTaskEntries(todoTable, username).forEach(({ task }) => pauseTaskTimer(task, now));
}

function clearUserFocusIfTask(userId, taskId) {
  if (getFocusedTaskId(userId) === taskId) {
    setFocusedTaskId(userId, null);
  }
}

/**
 * Ensure exactly one active task has a running timer: the focused one.
 * Picks first active if focus is missing/invalid.
 */
function reconcileUserFocus(todoTable, userId, username, now = Date.now()) {
  const active = getActiveUserTaskEntries(todoTable, username);
  if (active.length === 0) {
    setFocusedTaskId(userId, null);
    getUserTaskEntries(todoTable, username).forEach(({ task }) => pauseTaskTimer(task, now));
    return null;
  }

  let focusId = getFocusedTaskId(userId);
  let focused = active.find((e) => e.task.id === focusId);
  if (!focused) {
    focused = active[0];
    focusId = focused.task.id;
    setFocusedTaskId(userId, focusId);
  }

  getUserTaskEntries(todoTable, username).forEach(({ task }) => {
    if (!task.done && task.id === focusId) {
      if (task.focusStartedAt == null) startTaskTimer(task, now);
    } else {
      pauseTaskTimer(task, now);
    }
  });

  return focused.task;
}

/** Switch focus to another active task by user ordinal; returns { ok, message }. */
function switchFocusToUserOrdinal(todoTable, userId, username, userOrdinal, now = Date.now()) {
  const entry = getUserTaskEntryByOrdinal(todoTable, username, userOrdinal);
  if (!entry) {
    return { ok: false, message: `you don't have a task #${userOrdinal}` };
  }
  if (entry.task.done) {
    return { ok: false, message: `task #${userOrdinal} is already done` };
  }

  const active = getActiveUserTaskEntries(todoTable, username);
  const target = active.find((e) => e.task.id === entry.task.id);
  if (!target) {
    return { ok: false, message: `task #${userOrdinal} is already done` };
  }

  const prevId = getFocusedTaskId(userId);
  if (prevId) {
    const prevTask = todoTable.tasks.find((t) => t.id === prevId && t.username === username);
    if (prevTask) pauseTaskTimer(prevTask, now);
  }

  setFocusedTaskId(userId, entry.task.id);
  getUserTaskEntries(todoTable, username).forEach(({ task }) => {
    if (!task.done && task.id === entry.task.id) {
      startTaskTimer(task, now);
    } else {
      pauseTaskTimer(task, now);
    }
  });

  return { ok: true, task: entry.task };
}

/** Idempotent field backfill on `todoTable.tasks`. */
function migrateTaskFields(todoTable) {
  if (!todoTable.tasks || !Array.isArray(todoTable.tasks)) return;
  const userTable = database.get('userTable') || {};
  const nameToId = {};
  Object.keys(userTable).forEach((id) => {
    const u = userTable[id];
    if (u && u.name) nameToId[u.name] = id;
  });
  todoTable.tasks.forEach((task) => {
    if (!task.id) task.id = newTaskId();
    if (!task.userId && task.username && nameToId[task.username]) {
      task.userId = nameToId[task.username];
    }
    if (task.accumulatedMs == null) {
      if (task.done && task.doneAt != null && task.created != null && task.doneAt > task.created) {
        task.accumulatedMs = task.doneAt - task.created;
      } else {
        task.accumulatedMs = 0;
      }
    }
  });
}

module.exports = {
  MAX_TASKS_PER_DAY,
  MAX_TASKS_PER_DAY_MESSAGE,
  newTaskId,
  splitTaskTitles,
  parseTaskNumberList,
  getTaskFocusMap,
  setTaskFocusMap,
  getFocusedTaskId,
  setFocusedTaskId,
  getUserTaskEntries,
  getUserTaskEntryByOrdinal,
  getActiveUserTaskEntries,
  getFirstIncompleteUserOrdinal,
  findLastUserTaskGlobalIndex,
  pauseTaskTimer,
  startTaskTimer,
  getTaskElapsedMs,
  formatElapsedMs,
  finalizeTaskDuration,
  markTaskDone,
  pauseAllUserTaskTimers,
  clearUserFocusIfTask,
  reconcileUserFocus,
  switchFocusToUserOrdinal,
  migrateTaskFields,
};
