const ModIDs = [
  '625260341', // kat
  '594470471', // cait
  '738584885', // emmydotjs
  '571790466', // flawer
  '614073889', // smith
  '151640996', // imad
  '608113661', // mariya
  '509514282', // rngie
  '113816041', // saltine
  '679555136', // xhumming
  '470611865', // razzy
];

function isMod(userID) {
  return ModIDs.includes(userID);
}

module.exports = isMod;
