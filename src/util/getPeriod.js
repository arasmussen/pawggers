module.exports = function getPeriod() {
  const now = new Date();
  const period = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
  return JSON.stringify(`${period.month}/${period.year}`);
}