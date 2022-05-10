const database = require('../database');

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
  const subPointsTable = database.get('subPointsTable') || {};
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

// subPointsTable = {
//   1234: 5,
//   2468: 2,
// }
// userTable = {
//   1234: {
//     id: 1234,
//     name: 'sarah'
//   },
//   2468: {
//     id: 2468,
//     name: 'andrew'
//   }
// }

// userIDs = ['1234', '2468']
// users = [{id: 1234, name: 'sarah'}, {id: 2468, name: 'andrew'}]