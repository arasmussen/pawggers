const abbreviateNumber = require('../util/abbreviateNumber');
const database = require('../database');
const getPeriod = require('../util/getPeriod');

function getTwitch() {
  return require('../managers/twitch');
}

const CHANNEL = '#xhumming';
const DB_KEY = 'zoomiesChaseTable';
const WINNER_COUNTS_KEY = 'zoomiesWinnerCounts';
const LEGACY_WINNERS_LOG_KEY = 'zoomiesWinnersLog';

const MS = 60 * 1000;

let warn1Timeout = null;
let warn2Timeout = null;
let finishTimeout = null;

function clearTimers() {
  if (warn1Timeout) {
    clearTimeout(warn1Timeout);
    warn1Timeout = null;
  }
  if (warn2Timeout) {
    clearTimeout(warn2Timeout);
    warn2Timeout = null;
  }
  if (finishTimeout) {
    clearTimeout(finishTimeout);
    finishTimeout = null;
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWeightedWinner(chasers) {
  const total = chasers.reduce((sum, c) => sum + c.tickets, 0);
  let r = Math.floor(Math.random() * total);
  for (const c of chasers) {
    r -= c.tickets;
    if (r < 0) {
      return c;
    }
  }
  return chasers[chasers.length - 1];
}

function chaseCountLine(n) {
  const who = n === 1 ? '1 person is' : `${n} people are`;
  return `${who} trying to catch me, join them with !chase`;
}

function migrateLegacyZoomiesLogIfNeeded() {
  const legacy = database.get(LEGACY_WINNERS_LOG_KEY);
  if (!legacy?.entries?.length) {
    return;
  }
  const stats = database.get(WINNER_COUNTS_KEY) || {};
  for (let i = 0; i < legacy.entries.length; i++) {
    const entry = legacy.entries[i];
    const id = entry.winnerId;
    if (!id) {
      continue;
    }
    if (!stats[id]) {
      stats[id] = { name: entry.winnerName || 'Unknown', wins: 0 };
    }
    stats[id].wins += 1;
    if (entry.winnerName) {
      stats[id].name = entry.winnerName;
    }
  }
  database.set(WINNER_COUNTS_KEY, stats);
  database.set(LEGACY_WINNERS_LOG_KEY, null);
}

function recordWinnerWin(winnerUserId, winnerName) {
  migrateLegacyZoomiesLogIfNeeded();
  const stats = database.get(WINNER_COUNTS_KEY) || {};
  stats[winnerUserId] = stats[winnerUserId] || { name: winnerName, wins: 0 };
  stats[winnerUserId].wins += 1;
  stats[winnerUserId].name = winnerName;
  database.set(WINNER_COUNTS_KEY, stats);
}

function scheduleChaseEnd(startedAt) {
  clearTimers();

  warn1Timeout = setTimeout(() => {
    const c = database.get(DB_KEY);
    if (!c || c.startedAt !== startedAt) {
      return;
    }
    const n = c.chasers?.length || 0;
    const line = chaseCountLine(n);
    getTwitch().client.say(
      CHANNEL,
      `/announce STILL GOING! ${line}`
    );
  }, MS);

  warn2Timeout = setTimeout(() => {
    const c = database.get(DB_KEY);
    if (!c || c.startedAt !== startedAt) {
      return;
    }
    const n = c.chasers?.length || 0;
    const line = chaseCountLine(n);
    getTwitch().client.say(
      CHANNEL,
      `/announce NANANA CAN'T CATCH ME ${line}`
    );
  }, 2 * MS);

  finishTimeout = setTimeout(() => {
    const c = database.get(DB_KEY);
    if (!c || c.startedAt !== startedAt) {
      return;
    }
    finishZoomiesChase({});
  }, 3 * MS);
}

/** @param {{ client?: object, target?: string }} options */
function finishZoomiesChase(options) {
  const { client, target } = options || {};
  clearTimers();

  const chase = database.get(DB_KEY);
  if (!chase?.redeemerId || !chase.chasers?.length) {
    return { ok: false };
  }

  const winner = pickWeightedWinner(chase.chasers);
  const pawggers = getRandomInt(3000, 5000);

  const period = getPeriod();
  let userSpendTable = database.get('userSpendTable');
  userSpendTable = userSpendTable || {};
  userSpendTable[period] = userSpendTable[period] || {};
  userSpendTable[period][winner.userId] = userSpendTable[period][winner.userId] || {};
  userSpendTable[period][winner.userId].spend = userSpendTable[period][winner.userId].spend || 0;
  userSpendTable[period][winner.userId].spend += pawggers;
  database.set('userSpendTable', userSpendTable);

  recordWinnerWin(winner.userId, winner.userName);

  database.set(DB_KEY, null);

  const spend = abbreviateNumber(Number(userSpendTable[period][winner.userId].spend));
  const pretty = pawggers.toLocaleString();
  const msg = `${winner.userName} caught me and wins ${pretty} pawggers! They now have ${spend} pawggers.`;

  if (client && target) {
    client.say(target, msg);
  } else {
    getTwitch().client.say(CHANNEL, msg);
  }

  return { ok: true };
}

function startAfterRedeem(user) {
  clearTimers();

  let userTable = database.get('userTable');
  userTable = userTable || {};
  userTable[user.id] = user;
  database.set('userTable', userTable);

  const startedAt = Date.now();
  database.set(DB_KEY, {
    redeemerId: user.id,
    redeemerName: user.name,
    startedAt,
    chasers: [
      {
        userId: user.id,
        userName: user.name,
        tickets: 5,
      },
    ],
  });

  scheduleChaseEnd(startedAt);

  getTwitch().client.say(
    CHANNEL,
    `${user.name} triggered zoomies! see if you can catch me heheheh !chase`
  );
}

module.exports = {
  DB_KEY,
  WINNER_COUNTS_KEY,
  startAfterRedeem,
  finishZoomiesChase,
  clearTimers,
};
