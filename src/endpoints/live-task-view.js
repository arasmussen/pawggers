const generateTaskBody = require('../tasks/generateTaskBody');
const renderHTML = require('../util/renderHTML');
const socketServer = require('../managers/socket');

const PageCSS = `
`;
const PageJS = `
const socket = io();
socket.on('update-task-view', (message) => {
  document.body.innerHTML = message;
});
`;

module.exports = function(request, response, server) {
  console.log(`[${new Date().toISOString()}] /api/live-task-view`);

  // start socket server
  socketServer.start(server);

  // generate body
  const body = generateTaskBody();

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    title: 'Task Live View',
  }));
}
