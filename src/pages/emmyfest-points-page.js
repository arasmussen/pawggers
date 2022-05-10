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
  const subPointsTable = database.get('subPoints') || {};
  const userTable = database.get('userTable') || {};

  const userIDs = Object.keys(subPointsTable);
  const users = userIDs.map((userID) => {
    return userTable[userID];
  });

  const body = users.map((user) => {
    return `<div>Name: ${user.name}, Points: ${subPointsTable[user.id]}</div>`;
  }).join('');

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    title: 'EMMYFEST Points',
  }));
}

