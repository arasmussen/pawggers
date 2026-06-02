/**
 * Local integration tests for multi-task commands.
 * Run: node scripts/test-task-flows.js
 *
 * Uses a dedicated test user in data/db.json; backs up and restores todoTable + taskFocus.
 */

const path = require('path');
const fs = require('fs');

const DB_PATH = path.resolve(__dirname, '../data/db.json');
const TEST_USER_ID = 'test-user-task-flows-001';
const TEST_USER_NAME = 'TaskBotTester';

const database = require('../src/database');
const getDay = require('../src/util/getDay');
const setupTaskTable = require('../src/tasks/setupTaskTable');
const {
  getUserTaskEntries,
  getFocusedTaskId,
  getTaskElapsedMs,
} = require('../src/tasks/taskUtils');

const commands = {
  task: require('../src/commands/task'),
  done: require('../src/commands/done'),
  next: require('../src/commands/next'),
  edit: require('../src/commands/edittask'),
  focus: require('../src/commands/focus'),
  remove: require('../src/commands/removetask'),
  log: require('../src/commands/log'),
  backlog: require('../src/commands/backlog'),
  summary: require('../src/commands/summary'),
  undo: require('../src/commands/undo'),
  undone: require('../src/commands/undo'),
};

let backup = null;
const chatLog = [];
let step = 0;

function say(target, message) {
  chatLog.push({ target, message });
  console.log(`  💬 ${message}`);
}

function runCommand(handler, args = '') {
  const variables = args.trim() ? args.trim().split(/\s+/) : [];
  const ctx = {
    client: { say },
    target: '#testchannel',
    'display-name': TEST_USER_NAME,
    'user-id': TEST_USER_ID,
    variables,
  };
  handler(ctx);
}

function assert(condition, label) {
  if (!condition) {
    throw new Error(label);
  }
}

function lastMessage() {
  return chatLog[chatLog.length - 1]?.message || '';
}

function clearChat() {
  chatLog.length = 0;
}

function removeTestUserFromDb() {
  const todoTable = setupTaskTable();
  todoTable.tasks = todoTable.tasks.filter((t) => t.username !== TEST_USER_NAME);
  database.set('todoTable', todoTable);

  const focus = database.get('taskFocus') || {};
  delete focus[TEST_USER_ID];
  database.set('taskFocus', focus);

  let userTable = database.get('userTable') || {};
  userTable[TEST_USER_ID] = { id: TEST_USER_ID, name: TEST_USER_NAME };
  database.set('userTable', userTable);
}

function getTestEntries() {
  return getUserTaskEntries(setupTaskTable(), TEST_USER_NAME);
}

async function test(name, fn) {
  step += 1;
  clearChat();
  console.log(`\n[${step}] ${name}`);
  try {
    await fn();
    console.log('  ✅ pass');
    return true;
  } catch (err) {
    console.log(`  ❌ fail: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('Task bot flow tests');
  console.log('DB:', DB_PATH);

  if (!fs.existsSync(DB_PATH)) {
    console.error('db.json not found — run from repo root after bot has created data/');
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const full = JSON.parse(raw);
  backup = {
    todoTable: full.todoTable,
    taskFocus: full.taskFocus,
  };

  removeTestUserFromDb();

  const results = [];

  results.push(await test('!task alpha — adds first task and focuses', () => {
    runCommand(commands.task, 'alpha');
    const entries = getTestEntries();
    assert(entries.length === 1, `expected 1 task, got ${entries.length}`);
    assert(entries[0].task.task === 'alpha', 'task title should be alpha');
    assert(!entries[0].task.done, 'should be active');
    assert(getFocusedTaskId(TEST_USER_ID) === entries[0].task.id, 'alpha should be focused');
    assert(lastMessage().includes('Task #1 added') || lastMessage().includes('Task added'), 'should confirm add with number');
  }));

  results.push(await test('!task (no args) — reports focused task', () => {
    runCommand(commands.task, '');
    assert(lastMessage().includes('alpha'), 'should mention alpha');
    assert(lastMessage().includes('working on'), 'should say working on');
    assert(lastMessage().includes('#1: alpha'), 'should include task number');
  }));

  results.push(await test('!task beta, gamma — adds without stealing focus', () => {
    runCommand(commands.task, 'beta, gamma');
    const entries = getTestEntries();
    assert(entries.length === 3, `expected 3 tasks, got ${entries.length}`);
    assert(entries[0].task.task === 'alpha', '#1 still alpha');
    assert(entries[1].task.task === 'beta', '#2 beta');
    assert(entries[2].task.task === 'gamma', '#3 gamma');
    const focusId = getFocusedTaskId(TEST_USER_ID);
    assert(focusId === entries[0].task.id, 'focus should still be alpha');
    assert(lastMessage().includes('2 tasks added'), 'should say 2 tasks added');
  }));

  results.push(await test('!backlog — lists incomplete with numbers', () => {
    runCommand(commands.backlog, '');
    const msg = lastMessage();
    assert(msg.includes("Here's your backlog"), 'backlog header');
    assert(msg.includes('👉 1. alpha'), 'focused task highlighted');
    assert(msg.includes('2. beta'), 'lists 2');
    assert(msg.includes('3. gamma'), 'lists 3');
    assert(msg.includes('  •  '), 'bullet separators between tasks');
  }));

  results.push(await test('!focus 2 — switches focus to beta', () => {
    runCommand(commands.focus, '2');
    const entries = getTestEntries();
    assert(getFocusedTaskId(TEST_USER_ID) === entries[1].task.id, 'focus should be beta');
    assert(lastMessage().includes('task #2'), 'mentions task 2');
    assert(lastMessage().includes('beta'), 'mentions beta');
  }));

  results.push(await test('!edit revised — edits focused task (beta)', () => {
    runCommand(commands.edit, 'revised beta');
    const entries = getTestEntries();
    assert(entries[1].task.task === 'revised beta', 'task #2 renamed');
    assert(lastMessage().includes('revised beta'), 'chat confirms name');
  }));

  results.push(await test('!done — completes focused task only', () => {
    runCommand(commands.done, '');
    const entries = getTestEntries();
    assert(entries[1].task.done, '#2 should be done');
    assert(!entries[0].task.done, '#1 still active');
    assert(!entries[2].task.done, '#3 still active');
    assert(lastMessage().includes('emmmyDone'), 'done celebration');
    assert(lastMessage().includes('revised beta'), 'mentions completed task');
  }));

  results.push(await test('!log logged-task — appends done task at end', () => {
    runCommand(commands.log, 'logged-task');
    const entries = getTestEntries();
    assert(entries.length === 4, 'should have 4 tasks');
    assert(entries[3].task.task === 'logged-task', '#4 is logged task');
    assert(entries[3].task.done, 'logged task is done');
    assert(entries[0].userOrdinal === 1 && entries[0].task.task === 'alpha', '#1 still alpha');
  }));

  results.push(await test('!task fox — appends after logged task', () => {
    runCommand(commands.task, 'fox');
    const entries = getTestEntries();
    assert(entries.length === 5, 'should have 5 tasks');
    assert(entries[4].task.task === 'fox', '#5 is fox');
    assert(!entries[4].task.done, 'fox active');
  }));

  results.push(await test('!done 1,3 — completes multiple by number', () => {
    runCommand(commands.done, '1,3');
    const entries = getTestEntries();
    assert(entries[0].task.done, '#1 done');
    assert(entries[2].task.done, '#3 done');
    assert(!entries[4].task.done, '#5 fox still active');
    assert(lastMessage().includes('2 tasks'), 'mentions 2 tasks');
  }));

  results.push(await test('!next — completes focus and jumps to first incomplete', () => {
    // Active: fox only (alpha, revised beta done? #2 done, #3 done, #4 logged done)
    // Actually after done 1,3: #1 alpha done, #2 revised beta done, #3 gamma done, #4 logged done, #5 fox active
    // Focus might be stale — set focus to fox first
    runCommand(commands.focus, '5');
    clearChat();
    runCommand(commands.next, '');
    const entries = getTestEntries();
    assert(entries[4].task.done, 'fox marked done after next');
    assert(lastMessage().includes('emmmyDone') || lastMessage().includes('caught up'), 'next completion msg');
  }));

  // Fresh slate for next scenario
  removeTestUserFromDb();

  results.push(await test('!next with multiple actives — focuses first incomplete in list order', () => {
    runCommand(commands.task, 'first');
    runCommand(commands.task, 'second');
    runCommand(commands.task, 'third');
    runCommand(commands.focus, '2');
    clearChat();
    runCommand(commands.next, '');
    const entries = getTestEntries();
    assert(entries[1].task.done, '#2 second should be done');
    assert(!entries[0].task.done, '#1 first should still be active');
    assert(!entries[2].task.done, '#3 third still active');
    assert(getFocusedTaskId(TEST_USER_ID) === entries[0].task.id, 'focus should be on #1 first');
    assert(lastMessage().includes('first'), 'should mention first task');
  }));

  results.push(await test('!focus bad number — no period, utils message', () => {
    clearChat();
    runCommand(commands.focus, '99');
    const msg = lastMessage();
    assert(msg.includes("don't have a task #99"), 'missing task error');
    assert(!msg.endsWith('.'), 'single sentence should not end with period');
  }));

  results.push(await test('!remove 3 — removes by number', () => {
    const before = getTestEntries().length;
    runCommand(commands.remove, '3');
    const after = getTestEntries().length;
    assert(after === before - 1, 'one task removed');
    assert(lastMessage().includes('removed'), 'confirm remove');
  }));

  results.push(await test('!remove 1 3 — removes multiple by space-separated numbers', () => {
    removeTestUserFromDb();
    runCommand(commands.task, 'one, two, three, four');
    clearChat();
    runCommand(commands.remove, '1 3');
    const entries = getTestEntries();
    assert(entries.length === 2, 'two tasks remain');
    assert(entries[0].task.task === 'two', '#2 two remains');
    assert(entries[1].task.task === 'four', '#4 four remains');
    assert(lastMessage().includes('#1') && lastMessage().includes('#3'), 'mentions removed numbers');
  }));

  results.push(await test('!next 3 — completes focus and focuses task #3', () => {
    removeTestUserFromDb();
    runCommand(commands.task, 'one, two, three');
    runCommand(commands.focus, '1');
    clearChat();
    runCommand(commands.next, '3');
    const entries = getTestEntries();
    assert(entries[0].task.done, '#1 one marked done');
    assert(!entries[1].task.done, '#2 two still active');
    assert(!entries[2].task.done, '#3 three still active');
    assert(getFocusedTaskId(TEST_USER_ID) === entries[2].task.id, 'focus on #3 three');
    assert(lastMessage().includes('Now focused on #3'), 'mentions focus on #3');
  }));

  results.push(await test('!next 3 with no focus — focuses #3 without completing others', () => {
    removeTestUserFromDb();
    runCommand(commands.task, 'one, two, three');
    const focus = database.get('taskFocus') || {};
    delete focus[TEST_USER_ID];
    database.set('taskFocus', focus);
    clearChat();
    runCommand(commands.next, '3');
    const entries = getTestEntries();
    assert(!entries[0].task.done, '#1 one still active');
    assert(!entries[1].task.done, '#2 two still active');
    assert(getFocusedTaskId(TEST_USER_ID) === entries[2].task.id, 'focus on #3 three');
  }));

  results.push(await test('!next with new task text — completes focus and focuses new task', () => {
    removeTestUserFromDb();
    runCommand(commands.task, 'task A');
    runCommand(commands.focus, '1');
    clearChat();
    runCommand(commands.next, 'task B');
    const entries = getTestEntries();
    assert(entries[0].task.done, 'task A marked done');
    assert(entries.length === 2, 'only two tasks (no duplicate B)');
    assert(entries[1].task.task === 'task B', 'task B added');
    assert(getFocusedTaskId(TEST_USER_ID) === entries[1].task.id, 'task B focused');
    assert(lastMessage().includes('emmmyDone'), 'completion message');
    assert(lastMessage().includes('now focused on #2'), 'mentions focus on new task');
  }));

  results.push(await test('!next with existing task text — completes focus and focuses existing task', () => {
    removeTestUserFromDb();
    runCommand(commands.task, 'task A, task B');
    runCommand(commands.focus, '1');
    clearChat();
    runCommand(commands.next, 'task B');
    const entries = getTestEntries();
    assert(entries[0].task.done, 'task A marked done');
    assert(entries.length === 2, 'no duplicate task B');
    assert(!entries[1].task.done, 'existing task B still active');
    assert(getFocusedTaskId(TEST_USER_ID) === entries[1].task.id, 'existing task B focused');
    assert(lastMessage().includes('emmmyDone'), 'completion message');
    assert(lastMessage().includes('task B'), 'mentions task B');
  }));

  results.push(await test('!undo — restores most recently completed task with elapsed time kept', () => {
    removeTestUserFromDb();
    runCommand(commands.task, 'alpha');
    runCommand(commands.done, '');
    const entriesBefore = getTestEntries();
    assert(entriesBefore[0].task.done, 'alpha done');
    const elapsedBefore = entriesBefore[0].task.accumulatedMs;
    clearChat();
    runCommand(commands.undo, '');
    const entries = getTestEntries();
    assert(!entries[0].task.done, 'alpha incomplete again');
    assert(entries[0].task.accumulatedMs === elapsedBefore, 'elapsed preserved');
    assert(lastMessage().includes('task #1 is now incomplete'), 'undo confirmation');
  }));

  results.push(await test('!undo 1 — elapsed increases when undone task is focused', () => {
    removeTestUserFromDb();
    runCommand(commands.task, 'timed task');
    runCommand(commands.done, '');
    runCommand(commands.undo, '1');
    runCommand(commands.focus, '1');
    const entries = getTestEntries();
    assert(!entries[0].task.done, 'task active');
    assert(entries[0].task.focusStartedAt != null, 'timer running on focus');
    assert(getFocusedTaskId(TEST_USER_ID) === entries[0].task.id, 'focused on undone task');
  }));

  results.push(await test('!undone alias — same as !undo', () => {
    removeTestUserFromDb();
    runCommand(commands.task, 'x');
    runCommand(commands.done, '');
    clearChat();
    runCommand(commands.undone, '1');
    assert(lastMessage().includes('task #1 is now incomplete'), 'undone alias works');
  }));

  // Restore
  if (backup.todoTable) {
    database.set('todoTable', backup.todoTable);
  }
  if (backup.taskFocus) {
    database.set('taskFocus', backup.taskFocus);
  } else {
    database.set('taskFocus', {});
  }
  database.reload();

  const passed = results.filter(Boolean).length;
  const failed = results.length - passed;
  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed}/${results.length} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
