const database = require('../database');

const renderHTML = require('../util/renderHTML');

const PageCSS = `
  html, body, #container {
    width: 80%;
    height: 80%;
    font-family: 'Red Hat Mono', sans-serif;
    margin: 0;
    padding: 0;
  }
`;
const PageJS = ``;

module.exports = function(request, response, server) {
  const subPointsTable = database.get('subPoints') || {};
  const userTable = database.get('userTable') || {};

  const userIDs = Object.keys(subPointsTable);
  const users = userIDs.map((userID) => {
    return userTable[userID];
  });

  const body = users.map((user) => {
    const wheelSpins = Math.floor(subPointsTable[user.id]/5);
    let listOfSpins = '';
    for (let i = 0; i < wheelSpins; i++) {
       listOfSpins += `<div>${user.name}</div>`;
    }
    return listOfSpins;
  });

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    title: 'EMMYFEST Spins',
  }));
}

