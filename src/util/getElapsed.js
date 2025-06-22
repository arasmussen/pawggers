module.exports = function getElapsed(startTs, endTs = Date.now()) {
  const diffMs     = endTs - startTs;
  const totalMins  = Math.floor(diffMs / 60000);
  const hours      = Math.floor(totalMins / 60);
  const mins       = totalMins % 60;
  return `${hours}:${mins.toString().padStart(2,'0')}`; // “H:MM”
};