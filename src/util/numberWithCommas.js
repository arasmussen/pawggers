module.exports = function numberWithCommas(number) {
  if (typeof number !== 'number') {
    return 0;
  }
  const parts = number.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}