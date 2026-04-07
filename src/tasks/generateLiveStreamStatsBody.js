const escapeHTML = require('../util/escapeHTML');
const database = require('../database');
const getDay = require('../util/getDay');
const generateTaskBody = require('./generateTaskBody');

function generateFakeTaskBody() {
  const fake = [
    {
      username: 'sarah',
      tasks: [
        { task: 'prep stream + coffee', done: true, elapsed: '00:24' },
        { task: 'email inbox sweep', done: true, elapsed: '00:31' },
        { task: 'standup notes', done: true, elapsed: '00:18' },
        { task: 'review PR queue', done: true, elapsed: '00:42' },
        { task: 'work block: tickets', done: false, elapsed: '' },
        { task: 'stretch + water', done: false, elapsed: '' },
        { task: 'doc: onboarding draft', done: true, elapsed: '00:55' },
        { task: '1:1 prep', done: true, elapsed: '00:12' },
      ],
    },
    {
      username: 'chatpawgger',
      tasks: [
        { task: 'clean desk + water', done: true, elapsed: '00:11' },
        { task: 'pomodoro 1', done: true, elapsed: '00:25' },
        { task: 'pomodoro 2', done: true, elapsed: '00:25' },
        { task: 'flashcards — chapter 4', done: true, elapsed: '00:33' },
        { task: 'reading: paper outline', done: true, elapsed: '00:48' },
        { task: 'pomodoro 3', done: false, elapsed: '' },
        { task: 'outline essay intro', done: false, elapsed: '' },
      ],
    },
    {
      username: 'focusfriend',
      tasks: [
        { task: 'inbox zero (personal)', done: true, elapsed: '00:22' },
        { task: 'grocery list + order', done: true, elapsed: '00:15' },
        { task: 'laundry fold', done: false, elapsed: '' },
      ],
    },
  ];

  let body = '';
  for (const group of fake) {
    body += `<div class="username">${escapeHTML(group.username)}</div><ul>`;
    group.tasks.forEach((t, i) => {
      const taskClass = t.done ? 'task completed' : 'task';
      const taskNumber = String(i + 1).padStart(2, '0');
      const elapsedStr = t.elapsed ? ` ${escapeHTML(t.elapsed)}` : '';
      body += `<li><span class="taskNumber">${taskNumber}</span> <span class="${taskClass}"><span class="taskName">${escapeHTML(t.task)}</span><span class="elapsed">${elapsedStr}</span></span></li>`;
    });
    body += `</ul>`;
  }

  const done = fake.reduce((n, g) => n + g.tasks.filter((t) => t.done).length, 0);
  const total = fake.reduce((n, g) => n + g.tasks.length, 0);
  return `<div class="tasksStreamHeader"><div class="sectionTitle">TASKS</div><div class="tasksCounter">${done}/${total}</div></div><div id="scrollContainer" class="scrollContainer--topTaskFade"><ul>${body}</ul></div>`;
}

function generateDailyLeaderboardRows({ fake } = {}) {
  const day = getDay();
  const dailyTable = (database.get('dailyPawggersEarnedTable') || {})[day] || {};

  const totals = (fake
    ? [
        { name: 'sarah', earned: 12800 },
        { name: 'chatpawgger', earned: 5400 },
        { name: 'zoomieschamp', earned: 2600 },
      ]
    : Object.values(dailyTable)
  )
    .map((entry) => ({
      displayName: entry?.name || 'Unknown',
      earned: Number(entry?.earned) || 0,
    }))
    .filter((entry) => entry.earned > 0)
    .sort((a, b) => b.earned - a.earned || a.displayName.localeCompare(b.displayName))
    .slice(0, 3);

  if (totals.length === 0) {
    return { hasData: false, html: '' };
  }

  const html = totals
    .map((entry, index) => {
      const rank = index + 1;
      const earnedPretty = Number(entry.earned).toLocaleString('en-US');
      return `<div class="lb-row"><span class="lb-rank">#${rank}</span><span class="lb-name">${escapeHTML(entry.displayName)}</span><span class="lb-total">${earnedPretty}</span></div>`;
    })
    .join('');

  return { hasData: true, html };
}

function generateLiveStreamStatsBody({ fake } = {}) {
  const tasksHtml = fake ? generateFakeTaskBody() : generateTaskBody({ liveStreamStats: true });
  const dailyTop3 = generateDailyLeaderboardRows({ fake });

  return `
    <div class="section section--tasksFill">
      <div class="card">${tasksHtml}</div>
    </div>
    ${dailyTop3.hasData ? `
      <div class="section">
        <div class="card">
          <div class="sectionTitle">DAILY LEADERBOARD</div>
          <div class="leaderboard">${dailyTop3.html}</div>
        </div>
      </div>
    ` : ''}
  `;
}

module.exports = generateLiveStreamStatsBody;
