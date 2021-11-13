module.exports = function abbreviateNumber(number) {
  if (number < 1000) {
    return number;
  }

  const fraction = number / 1000;
  if (Math.round(fraction) < 1000) {
    return (fraction).toFixed(1) + 'k';
  }

  return (number / 1000000).toFixed(1) + 'm';
}