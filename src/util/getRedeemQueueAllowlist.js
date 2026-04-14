const config = require('../config');
const { BREAK_REWARD_IDS } = require('./breakRedeemDisplay');

// All break redeems (Game + Culture + Music + Watch). Used when config is missing.
const DEFAULT_ALLOWLIST = [
  BREAK_REWARD_IDS.gameBreak,
  BREAK_REWARD_IDS.cultureBreak,
  BREAK_REWARD_IDS.musicBreak,
  BREAK_REWARD_IDS.watchBreak,
];

module.exports = function getRedeemQueueAllowlist() {
  const ids = config?.redeemQueue?.rewardIds;
  if (Array.isArray(ids) && ids.length > 0) return ids;
  return DEFAULT_ALLOWLIST;
};
