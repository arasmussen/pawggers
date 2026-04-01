const escapeHTML = require('../util/escapeHTML');
const getElapsed = require('../util/getElapsed');
const setupTaskTable = require('./setupTaskTable');

// silly decoy tasks for april fools
const DECOY_TASKS = [
  'touch grass',
  'stare out the window',
  'nap again',
  'give emmy a treat',
  "tell emmy she's a good girl",
  'pet emmy on the head',
  'give emmy ear scritches',
  'ask emmy how her day is going',
  'give emmy a belly rub',
  'check if emmy needs water',
  "let emmy know she's doing great",
  'inform emmy of current task status',
  'ask emmy for her input',
  'get the w',
  'get the l',
  'f in the chat',
  'contemplate skill issue',
  'slay',
  'do the thing',
  'cook',
  'girl boss',
  'get this place humid',
  'uwu',
  'ls;fajdlkf',
  'dlsaj;dlskgjlkj',
  'asdlgjdsk',
  'lsdagj;dalsgjk',
  'tell emmy about day',
  'channel inner emmy',
  'catjam',
  'schedule meeting about the meeting',
  'take it offline',
  'synergize',
  'touch base',
  'talk to manager about the thing',
  'spill the tea',
  'get the tea',
  'stare at all',
  'third lunch',
  'third dinner',
  'third breakfast',
  'snack',
  '1:1 with emmy',
  'pokopia because lul',
  'look busy',
  'wave at sarah',
  'hydrate sarah',
  'ask sarah about the thing',
  'ask sarah for her input',
  'ask sarah for her help',
  'ask sarah for her advice',
  'ask sarah for her opinion',
  'ask sarah for her thoughts',
  'ask sarah for her feelings',
  'ask emmy for her input',
  'ask emmy for her help',
  'ask emmy for her advice',
  'ask emmy for her opinion',
  'ask emmy for her thoughts',
  'ask emmy for her feelings',
  'ask emmy for her input',
  'ask emmy for her help',
  'escalate to sarah',
  'compliment sarah',
  'use the toilet',
  'forget to wash hands',
  'zone out',
  'daydream',
  'stand up and then sit down',
  'hail emmy',
  'snack again',
  'run it by emmy',
  'run it by sarah',
  'consider a nap',
  'deny the hunger',
  'is it dinner yet',
  'is it break time yet',
  'exist',
  'turn it off and back on',
  'ship it',
  'test in prod',
  'force push',
  'hotfix the hotfix',
  'write tests (later)',
  'study (later)',
  'fix it in post',
  'just deploy it',
  'prayge emmy overlord',
];

// deterministic shuffle so each user gets a stable order of unique decoy tasks
function shuffleDecoysForUser(username) {
  const arr = DECOY_TASKS.slice();
  // simple hash from username
  let seed = 0;
  for (let i = 0; i < username.length; i++) {
    seed = (seed * 31 + username.charCodeAt(i)) >>> 0;
  }
  // fisher-yates using seed
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function generateDecoyTaskBody() {
  const todoTable = setupTaskTable();

  const tasksDone = todoTable.tasks.filter((task) => {
    return task.done;
  }).length;

  const totalTasks = todoTable.tasks.length;

  const byUser = todoTable.tasks.reduce((acc, task) => {
    acc[task.username] = acc[task.username] || [];
    acc[task.username].push(task);
    return acc;
  }, {});

  let body = '';
  for (const [username, tasks] of Object.entries(byUser)) {
    body += `<div class="username">${escapeHTML(username)}</div><ul>`;
    const decoysForUser = shuffleDecoysForUser(username);
    tasks.forEach((task, i) => {
      const fakeText = decoysForUser[i % decoysForUser.length];
      const taskClass = task.done ? 'task completed' : 'task';
      const taskNumber = String(i + 1).padStart(2, '0');
      const elapsedStr = (task.done && task.created != null && task.doneAt != null && task.doneAt > task.created)
        ? ` ${getElapsed(task.created, task.doneAt)}`
        : '';
      body += `<li><span class="taskNumber">${taskNumber}</span> <span class="${taskClass}"><span class="taskName">${escapeHTML(fakeText)}</span><span class="elapsed">${elapsedStr}</span></span></li>`;
    });
    body += `</ul>`;
  }

  return `<div class="tasksDone"> TASKS<div class="tasksCounter">${tasksDone}/${totalTasks}</div></div><div id="scrollContainer"><ul>${body}</ul></div>`;
}

module.exports = generateDecoyTaskBody;

