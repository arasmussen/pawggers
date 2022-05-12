const generatePointsBody = require('../subs/generatePointsBody');
const renderHTML = require('../util/renderHTML');

const PageCSS = `
  html, body, #container {
    width: 100%;
    height: 100%;
    font-family: 'Red Hat Mono', sans-serif;
    margin: 0;
    padding: 20px;
  }

  .userContainer {
    display: flex;
    margin: 0 0 5px 0;
    padding: 5px 10px;
    width: 100%;
    border-radius: 10px;
  }

  .userContainer:nth-child(1) {
    background: #e6e6e6;
  }

  .user {
    margin: 0 10px 0 0;
    white-space: nowrap;
  }

  .userRewards {
    display: flex;
    flex-wrap: wrap;
  }

  .reward {
    display: flex;
  }

  label {
    margin: 0 10px 0 0;
    white-space: nowrap;
  }
`;
const PageJS = `
const socket = io();
socket.on('update-points-view', (message) => {
  document.body.innerHTML = message;
});

function onCheckboxChecked(checkbox) {
  socket.emit('points-reward-checked', {
    id: checkbox.id,
    checked: checkbox.checked,
  });
}
`;

module.exports = function(request, response, server) {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: generatePointsBody(),
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    title: 'EMMYFEST Points',
  }));
}

