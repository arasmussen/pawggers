const database = require('../database');
const getDay = require('../util/getDay');

function setupHydratorsTable() {
  const today = getDay();
  let hydratorsTable = database.get('hydratorsTable');
  hydratorsTable = hydratorsTable || {
    day: today,
    hydrators: [],
  };

  if (hydratorsTable.day && hydratorsTable.day !== today) {
    hydratorsTable = {
      day: today,
      hydrators: [],
    };
  }
  database.set('hydratorsTable', hydratorsTable);

  return hydratorsTable;
}

module.exports = setupHydratorsTable;
