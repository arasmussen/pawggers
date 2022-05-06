const PointValues = {
  '1000': 1,
  '2000': 2,
  '3000': 6,
};

function tierToPoints(tier) {
  if (!PointValues[tier]) {
    throw new Error('invalid tier: ' + tier);
  }
  
  return PointValues[tier];
}

module.exports = tierToPoints;