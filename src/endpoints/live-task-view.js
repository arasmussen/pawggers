const generateTaskBody = require('../tasks/generateTaskBody');
const renderHTML = require('../util/renderHTML');
const socketServer = require('../managers/socket');

const PageCSS = `
  @font-face {
    font-family: 'Visitor';
    src: url('https://emmy.dog/fonts/visitor1-webfont.woff2') format('woff2'),
         url('https://emmy.dog/fonts/visitor1-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
  body {
    font-size: 18px;
    font-family: 'Rubik', sans-serif;
    font-weight: 400;
    color:#fff;
    background: rgba(0, 0, 0, 0.5);
  }
  .tasksDone {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0.03em;
    color: #fff;
    font-family: 'Rubik', sans-serif;
    padding: 0 12px 0 8px;
  }
  .username {
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.03em;
    margin: 0 8px 0 0;
  }
  .task {
    font-weight: 500;
    color: #fff;
    letter-spacing: 0.02em;
    margin: 0 2px 0 0;
    opacity: 0.95;
  }
  .task.completed .taskName {
    text-decoration: line-through;
    opacity: 0.75;
  }
  .taskNumber {
    font-weight: 600;
    min-width: 1.5em;
    margin-right: 6px;
    opacity: 0.9;
    letter-spacing: 1px;
  }
  .elapsed {
    font-weight: 400;
    opacity: 0.65;
    letter-spacing: 0.01em;
    margin-left: 4px;
  }
  #scrollContainer {
    height: 612px;
    overflow-y:scroll;
    margin: 9px 0 0 0;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  #scrollContainer::-webkit-scrollbar {display: none;}
  ul {padding: 5px 0 1px 0;margin: 0;}
  li {
    list-style-type: none;
    display: flex;
    margin-bottom: 4px;
    letter-spacing: -0.02em;
  }
`;
const PageJS = `
const socket = io();
socket.on('update-task-view', (message) => {
  // get current scroll
  const scrollContainer = document.getElementById('scrollContainer');
  const prevScroll = scrollContainer.scrollTop;

  // replace html/data 
  document.body.innerHTML = message;

  // update scroll
  const newScrollContainer = document.getElementById('scrollContainer');
  newScrollContainer.scrollBy(0, prevScroll);
});

let scrollingDown = true;
let scrollInterval;

function listScroll() {
  const scrollContainer = document.getElementById('scrollContainer');
  const containerHeight = scrollContainer.offsetHeight;
  const containerScroll = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  if (scrollingDown) {
    const scrollRemaining = scrollHeight - containerHeight - containerScroll;
    if (scrollRemaining <= 0) {
      scrollingDown = false;
      pauseScroll();
    }
  } else {
    const scrollRemaining = containerScroll;
    if (scrollRemaining <= 0) {
      scrollingDown = true;
      pauseScroll();
    }
  }

  scrollContainer.scrollBy(0, scrollingDown ? 1 : -1);
}

function pauseScroll() {
  clearInterval(scrollInterval);
  setTimeout(startScroll, 5000);
}

function startScroll() {
  scrollInterval = setInterval(listScroll, 70);
}

function main() {
  startScroll();
}

window.onload = main;
`;
const PageLink = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700&display=swap" rel="stylesheet">';

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
    link: PageLink,
    title: 'Task Live View',
  }));
}
