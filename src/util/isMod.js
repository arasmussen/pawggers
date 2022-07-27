const ModIDs = [
  '625260341', // kat
  '594470471', // cait
  '738584885', // emmydotjs
  '571790466', // flawer
  '151640996', // imad
  '509514282', // rngie
  '679555136', // xhumming
  '470611865', // razzy
];

function isMod(userID) {
  return ModIDs.includes(userID);
}

module.exports = isMod;
