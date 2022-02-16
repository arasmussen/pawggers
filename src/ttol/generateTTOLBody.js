const escapeHTML = require('../util/escapeHTML');
const database = require('../database');

function generateTTOLData() {
  let ttolTable = database.get('ttolTable');
  // var data = [
  //     {x: "A", value: 4},
  //     {x: "B", value: 3},
  //     {x: "C", value: 8},
  // ];
  return data;
}

module.exports = generateTTOLData;
