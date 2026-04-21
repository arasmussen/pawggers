const abbreviateNumber = require('../util/abbreviateNumber');
const config = require('../config');
const database = require('../database');
const getPeriod = require('../util/getPeriod');
const isMod = require('../util/isMod');

function getTwitch() {
  return require('../managers/twitch');
}

const CHANNEL = `#${config.channel.name}`;
const DB_KEY = 'zoomiesChaseTable';
const WINNER_COUNTS_KEY = 'zoomiesWinnerCounts';

const MS = 60 * 1000;

let tickInterval = null;

function clearTimers() {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = null;
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
  } catch (e) {
    console.warn('[zoomies] failed to say message', e?.message || e);
  }
}

function scheduleChaseEnd(startedAt) {
  clearTimers();

  tickInterval = setInterval(() => {
    const c = database.get(DB_KEY);
    if (!c || c.startedAt !== startedAt) {
      clearTimers();
      return;
    }

    const elapsedMs = Date.now() - c.startedAt;
    const n = c.chasers?.length || 0;
    const line = chaseCountLine(n);

    // 2 minutes left (1 minute in)
    if (!c.warn2MinSent && elapsedMs >= 1 * MS) {
      c.warn2MinSent = true;
      database.set(DB_KEY, c);
      safeSay(`emmmyTipTap NANANA CAN'T CATCH ME ${line}`);
      return;
    }

    // 1 minute left (2 minutes in)
    if (!c.warn1MinSent && elapsedMs >= 2 * MS) {
      c.warn1MinSent = true;
      database.set(DB_KEY, c);
      safeSay(`emmmyTipTap STILL GOING! ${line}`);
      return;
    }

    // 30 seconds left (2:30)
    if (!c.warn10sSent && elapsedMs >= (2 * MS) + (30 * 1000)) {
      c.warn10sSent = true;
      database.set(DB_KEY, c);
      safeSay(`emmmyTipTap phew i'm getting tired now.. ${line}`);
      return;
    }

    // Finish at 3 minutes
    if (elapsedMs >= 3 * MS) {
      finishZoomiesChase({});
    }
  }, 1000);
}

/** @param {{ client?: object, target?: string }} options */
function finishZoomiesChase(options) {
  const { client, target } = options || {};
  clearTimers();

  const chase = database.get(DB_KEY);
  if (!chase?.redeemerId || !chase.chasers?.length) {
    return { ok: false };
  }

  const chasers = chase.chasers;
  const nonMods = chasers.filter((c) => !isMod(String(c.userId)));

  let firstPick = pickWeightedWinner(chasers);
  let winner = firstPick;

  if (isMod(String(firstPick.userId))) {
    safeSay(`@${firstPick.userName} caught me, but i escaped!`);
    if (nonMods.length === 0) {
      safeSay(`everyone chasing was a mod — no pawggers this round`);
      database.set(DB_KEY, null);
      return { ok: true };
    }
    winner = pickWeightedWinner(nonMods);
  }

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
      { userId: user.id, userName: user.name, tickets: 3 },
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

