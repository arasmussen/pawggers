const abbreviateNumber = require('../util/abbreviateNumber');
const database = require('../database');
const getPeriod = require('../util/getPeriod');

module.exports = function(context) {
  const period = getPeriod();
  const pirateLootTable = database.get('pirateLootTable') || {};
  const looted = Number(pirateLootTable[period] || 0);
  const amount = abbreviateNumber(looted);

  const { client, target } = context;
  client.say(target, `Pirates have looted ${amount} so far this month. Arrrrrr emmmyPirate`);
};
