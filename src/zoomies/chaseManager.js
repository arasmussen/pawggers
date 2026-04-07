const abbreviateNumber = require('../util/abbreviateNumber');
const config = require('../config');
const database = require('../database');
const getPeriod = require('../util/getPeriod');

function getTwitch() {
  return require('../managers/twitch');
}

const CHANNEL = `#${config.channel.name}`;
const DB_KEY = 'zoomiesChaseTable';
const WINNER_COUNTS_KEY = 'zoomiesWinnerCounts';

const MS = 60 * 1000;

let warn1Timeout = null;      // 1 minute in (2 min left)
let warn2Timeout = null;      // 2 minutes in (1 min left)
let warnFinalTimeout = null;  // 10 seconds left
let finishTimeout = null;     // 3 minutes in

function clearTimers() {
  if (warn1Timeout) clearTimeout(warn1Timeout);
  if (warn2Timeout) clearTimeout(warn2Timeout);
  if (warnFinalTimeout) clearTimeout(warnFinalTimeout);
  if (finishTimeout) clearTimeout(finishTimeout);
  warn1Timeout = null;
  warn2Timeout = null;
  warnFinalTimeout = null;
  finishTimeout = null;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollZoomiesPayout() {
  // Weighted tiers: higher is rarer; 8k–10k is super rare
  const r = Math.floor(Math.random() * 1000); // 0..999
  if (r < 620) return getRandomInt(2000, 3500);   // 62.0%
  if (r < 880) return getRandomInt(3501, 5000);   // 26.0%
  if (r < 960) return getRandomInt(5001, 7000);   // 8.0%
  if (r < 995) return getRandomInt(7001, 7999);   // 3.5%
  return getRandomInt(8000, 10000);               // 0.5%
}

function pickWeightedWinner(chasers) {
  const total = chasers.reduce((sum, c) => sum + c.tickets, 0);
  let r = Math.floor(Math.random() * total);
  for (const c of chasers) {
    r -= c.tickets;
    if (r < 0) return c;
  }
  return chasers[chasers.length - 1];
}

function chaseCountLine(n) {
  const who = n === 1 ? '1 person is' : `${n} people are`;
  return `${who} trying to catch me, join them with !chase`;
}

function recordWinnerWin(winnerUserId, winnerName) {
  const stats = database.get(WINNER_COUNTS_KEY) || {};
  stats[winnerUserId] = stats[winnerUserId] || { name: winnerName, wins: 0 };
  stats[winnerUserId].wins += 1;
  stats[winnerUserId].name = winnerName;
  database.set(WINNER_COUNTS_KEY, stats);
}

function safeSay(message) {
  try {
    const client = getTwitch()?.client;
    if (!client) {
      console.warn('[zoomies] twitch client not ready, dropping message:', message);
      return;
    }
    client.say(CHANNEL, message);
    console.log('[zoomies] sent:', message);
  } catch (e) {
    console.warn('[zoomies] failed to say message', e?.message || e);
  }
}

function scheduleChaseEnd(startedAt) {
  clearTimers();

  // 2 minutes left (1 minute in)
  warn1Timeout = setTimeout(() => {
    const c = database.get(DB_KEY);
    if (!c || c.startedAt !== startedAt) return;
    const line = chaseCountLine(c.chasers?.length || 0);
    console.log('[zoomies] 2 min left warning firing');
    safeSay(`/announce NANANA CAN'T CATCH ME ${line}`);
  }, MS);

  // 1 minute left (2 minutes in)
  warn2Timeout = setTimeout(() => {
    const c = database.get(DB_KEY);
    if (!c || c.startedAt !== startedAt) return;
    const line = chaseCountLine(c.chasers?.length || 0);
    console.log('[zoomies] 1 min left warning firing');
    safeSay(`/announce STILL GOING! ${line}`);
  }, 2 * MS);

  // 10 seconds left (2:50)
  warnFinalTimeout = setTimeout(() => {
    const c = database.get(DB_KEY);
    if (!c || c.startedAt !== startedAt) return;
    const line = chaseCountLine(c.chasers?.length || 0);
    console.log('[zoomies] 10s left warning firing');
    safeSay(`/announce phew i'm getting tired now.. ${line}`);
  }, (3 * MS) - (10 * 1000));

  finishTimeout = setTimeout(() => {
    const c = database.get(DB_KEY);
    if (!c || c.startedAt !== startedAt) return;
    console.log('[zoomies] auto-finish firing');
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
  const pawggers = rollZoomiesPayout();

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
  const msg = `${winner.userName} caught me and wins ${pretty} pawggers! They now have ${spend} pawggers`;

  if (client && target) {
    client.say(target, msg);
  } else {
    safeSay(msg);
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
      { userId: user.id, userName: user.name, tickets: 5 },
    ],
  });

  scheduleChaseEnd(startedAt);

  safeSay(`${user.name} triggered zoomies! see if you can catch me heheheh !chase`);
}

module.exports = {
  DB_KEY,
  startAfterRedeem,
  finishZoomiesChase,
};

