const database = require('../database');
const escapeHTML = require('../util/escapeHTML');
const renderHTML = require('../util/renderHTML');
const abbreviateNumber = require('../util/abbreviateNumber');

const PageCSS = `
  html, body, #container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 40px 0;
    font-family: 'Rubik', sans-serif;
    text-align: center;
    box-sizing: border-box;
    background: #d9a7c7;
    background: -webkit-linear-gradient(340deg, #ffc3b5, #ffecdc);
    background: linear-gradient(340deg, #ffc3b5, #ffecdc);
  }

  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 480px;
    width: 100%;
  }

  h1 {
    margin: 0 0 20px 0;
    font-size: 40px;
    color: #fc7354;
  }

  .back-link {
    position: absolute;
    top: 20px;
    left: 20px;
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: color 200ms ease;
  }

  .back-link:hover {
    color: #fc7354;
  }

  .leaderboard {
    width: 100%;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .leaderboard + .leaderboard {
    margin-top: 24px;
  }

  .leaderboard h2 {
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 0.08em;
    color: #d19588;
    margin: 0 0 8px 0;
    font-weight: 600;
    text-align: left;
  }

  .leaderboard-list {
    max-height: 320px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .leaderboard-list::-webkit-scrollbar {
    width: 6px;
  }

  .leaderboard-list::-webkit-scrollbar-thumb {
    background: #d19588;
    border-radius: 3px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    margin: 4px 0;
    border-radius: 8px;
    background: white;
    font-size: 15px;
  }

  .row.top-3 {
    font-weight: 600;
  }

  .row .rank {
    min-width: 32px;
    text-align: left;
    color: #fc7354;
    font-weight: 600;
  }

  .row .name {
    flex: 1;
    text-align: left;
    margin: 0 12px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row .total {
    min-width: 48px;
    text-align: right;
    color: #333;
    font-weight: 500;
  }

  .empty {
    color: #d19588;
    padding: 24px;
    font-size: 15px;
  }
`;

module.exports = function (request, response, server) {
  const taskStatsByUser = database.get('taskStatsByUser') || {};
  const userTable = database.get('userTable') || {};

  const totals = [];
  for (const [userId, months] of Object.entries(taskStatsByUser)) {
    const total = Object.values(months).reduce((sum, n) => sum + n, 0);
    const displayName = userTable[userId]?.name || 'Unknown';
    totals.push({ userId, displayName, total });
  }
  totals.sort((a, b) => b.total - a.total);

  let taskRowsHtml = '';
  if (totals.length === 0) {
    taskRowsHtml = '<p class="empty">No stats yet.</p>';
  } else {
    totals.forEach((entry, index) => {
      const rank = index + 1;
      const top3 = rank <= 3 ? ' top-3' : '';
      taskRowsHtml += `<div class="row${top3}"><span class="rank">#${rank}</span><span class="name">${escapeHTML(entry.displayName)}</span><span class="total">${entry.total}</span></div>`;
    });
  }

  const checkInUsersTable = database.get('checkInUsersTable') || {};
  const checkInTotals = [];
  for (const [userId, data] of Object.entries(checkInUsersTable)) {
    const total = data.checkInCount || 0;
    const displayName = userTable[userId]?.name || 'Unknown';
    checkInTotals.push({ userId, displayName, total });
  }
  checkInTotals.sort((a, b) => b.total - a.total);

  let checkInRowsHtml = '';
  if (checkInTotals.length === 0) {
    checkInRowsHtml = '<p class="empty">No check-ins yet.</p>';
  } else {
    checkInTotals.forEach((entry, index) => {
      const rank = index + 1;
      const top3 = rank <= 3 ? ' top-3' : '';
      checkInRowsHtml += `<div class="row${top3}"><span class="rank">#${rank}</span><span class="name">${escapeHTML(entry.displayName)}</span><span class="total">${entry.total}</span></div>`;
    });
  }

  const FAKE_LEADERBOARD = [
    { displayName: 'studybuddy42', spend: 125000 },
    { displayName: 'cozyreads', spend: 98200 },
    { displayName: 'pomopup', spend: 87600 },
    { displayName: 'focusmode', spend: 65400 },
    { displayName: 'quietgrind', spend: 52100 },
    { displayName: 'desklamp', spend: 43800 },
    { displayName: 'notionally', spend: 39200 },
    { displayName: 'highlight', spend: 28700 },
    { displayName: 'marginalia', spend: 21500 },
    { displayName: 'bookmark', spend: 18400 },
  ];

  const monthName = new Date().toLocaleString('default', { month: 'long' });
  let pawggersRowsHtml = '';
  FAKE_LEADERBOARD.forEach((entry, index) => {
    const rank = index + 1;
    const top3 = rank <= 3 ? ' top-3' : '';
    const displaySpend = abbreviateNumber(entry.spend);
    pawggersRowsHtml += `<div class="row${top3}"><span class="rank">#${rank}</span><span class="name">${escapeHTML(entry.displayName)}</span><span class="total">${displaySpend}</span></div>`;
  });

  const body = `
    <a class="back-link" href="/">← Home</a>
    <div class="main-container">
      <h1>emmyHQ Dashboard</h1>
      <div class="leaderboard">
        <h2>${monthName} leaderboard</h2>
        <div class="leaderboard-list">${pawggersRowsHtml}</div>
      </div>
      <div class="leaderboard">
        <h2>Tasks completed</h2>
        <div class="leaderboard-list">${taskRowsHtml}</div>
      </div>
      <div class="leaderboard">
        <h2>Check-ins</h2>
        <div class="leaderboard-list">${checkInRowsHtml}</div>
      </div>
    </div>
  `;

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body,
    css: PageCSS,
    includeSocketIO: false,
    js: '',
    title: 'emmyHQ Dashboard',
  }));
};
