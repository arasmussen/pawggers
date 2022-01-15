module.exports = function getDay() {
  const now = new Date();
  const period = {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
  return `${period.month}/${period.day}/${period.year}`;
}