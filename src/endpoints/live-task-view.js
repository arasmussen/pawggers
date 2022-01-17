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
    font-family: 'Red Hat Mono', sans-serif;
    font-weight: 400;
    color:#555;
  }
  .tasksDone {
    font-size: 30px;
    color: #c09dc2;
    font-family: 'Visitor', sans-serif
  }
  .username {font-weight: 500;color: #222;}
  #scrollContainer {
    height: 363px;
    overflow-y:scroll;
    margin: 2px 0 0 0;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  #scrollContainer::-webkit-scrollbar {display: none;}
  ul {padding: 6px 0 4px 0;margin: 0;}
  li {
    list-style-type:none;
    display: flex;
    align-items: center;
    margin-bottom: 2.5px;
  }
  .box {
    width: 20px;
    min-width: 20px;
    height: 20px;
    border: 2px solid #c09dc2;
    border-radius: 4px;
    margin-right: 5px;
  }
  .box.checked {
    border: 2px solid #c09dc2;
    background: #c09dc2; 
  }
  .check:after{
    content: '';
    display: block;
    width: 7px;
    height: 13px;
    border: solid #fff;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
    margin: 0 0 0 4px;
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
const PageLink = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Red+Hat+Mono:wght@400;500" rel="stylesheet">';

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
