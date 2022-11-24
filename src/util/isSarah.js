const SarahID = '679555136';
const EmmyID = '738584885';

function isSarah(userID) {
  return userID === SarahID || userID === EmmyID;
}

module.exports = isSarah;