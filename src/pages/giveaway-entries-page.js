const database = require('../database');
const getDay = require('../util/getDay');
const renderHTML = require('../util/renderHTML');

const PageCSS = `
  html, body, #container {
    width: 80%;
    height: 80%;
    margin: 0;
    padding: 0;
  }
`;
const PageJS = ``;

module.exports = function(request, response, server) {
  const today = getDay();
  let giveawayEntryTable = database.get('giveawayEntryTable');

  giveawayEntryTable = giveawayEntryTable || {
    entries: [],
  };

  const body = giveawayEntryTable.entries.map((entry) => {
    return `<div>${entry.date} ${entry.username}</div>`;
  }).join('');

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    title: 'Giveaway Entries',
  }));
}
