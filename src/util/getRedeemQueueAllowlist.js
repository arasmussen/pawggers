const config = require('../config');

// Fallback so queue/break features still work if config isn't deployed.
// This is your GameBreak reward id from `src/reward-hooks/index.js`.
const DEFAULT_ALLOWLIST = ['eec682f1-8e79-40c0-b580-f12bd4dd869c'];

module.exports = function getRedeemQueueAllowlist() {
  const ids = config?.redeemQueue?.rewardIds;
  if (Array.isArray(ids) && ids.length > 0) return ids;
  return DEFAULT_ALLOWLIST;
};

