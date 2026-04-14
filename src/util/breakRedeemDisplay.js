/**
 * Reward IDs for break redeems (keep in sync with src/reward-hooks/index.js).
 */
const IDS = {
  gameBreak: 'eec682f1-8e79-40c0-b580-f12bd4dd869c',
  cultureBreak: '72643134-9360-48f0-9763-2dc2f0768c7b',
  musicBreak: 'b8a53ce8-851c-44d7-b529-ec40367b0fb7',
  watchBreak: '83af6303-7555-49b4-9881-1507fd1f5cee',
};

/**
 * Overlay NEXT BREAK line (caller escapes for HTML).
 * @param {object} entry redeemQueue item
 * @returns {string}
 */
function getBreakDisplayLine(entry) {
  if (!entry) return '';

  if (entry.isManual === true || String(entry.id) === 'manual_nextbreak') {
    return String(entry.userInput || '').trim();
  }

  const rid = String(entry.reward?.id || '');
  const userInput = String(entry.userInput || '').trim();
  const redeemer = String(entry.user?.name || 'someone').trim();

  if (rid === IDS.gameBreak) {
    return userInput ? `game: ${userInput}` : '';
  }
  if (rid === IDS.cultureBreak) {
    return 'memes';
  }
  if (rid === IDS.musicBreak) {
    return 'sarah playing music';
  }
  if (rid === IDS.watchBreak) {
    return `${redeemer}'s watch break`;
  }

  return userInput || String(entry.reward?.title || '').trim();
}

/**
 * Short label for !redeems chat only: game break, memes, music break, watch break.
 */
function getRedeemChatShortLabel(entry) {
  if (!entry) return '';

  if (entry.isManual === true || String(entry.id) === 'manual_nextbreak') {
    const t = String(entry.userInput || '').trim();
    return t || 'manual';
  }

  const rid = String(entry.reward?.id || '');
  if (rid === IDS.gameBreak) return 'game break';
  if (rid === IDS.cultureBreak) return 'memes';
  if (rid === IDS.musicBreak) return 'music break';
  if (rid === IDS.watchBreak) return 'watch break';

  return String(entry.reward?.title || 'redeem').trim();
}

module.exports = {
  BREAK_REWARD_IDS: IDS,
  getBreakDisplayLine,
  getRedeemChatShortLabel,
};
