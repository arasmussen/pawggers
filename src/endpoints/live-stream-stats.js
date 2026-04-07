const generateLiveStreamStatsBody = require('../tasks/generateLiveStreamStatsBody');
const renderHTML = require('../util/renderHTML');
const socketServer = require('../managers/socket');
const { URL } = require('url');

const PageCSS = `
  @font-face {
    font-family: 'Visitor';
    src: url('https://emmy.dog/fonts/visitor1-webfont.woff2') format('woff2'),
         url('https://emmy.dog/fonts/visitor1-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
  html, body {
    height: 100%;
    margin: 0;
  }
  body {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    font-size: 18px;
    font-family: 'Rubik', sans-serif;
    font-weight: 400;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
  }

  .section {
    padding: 0 0 8px 0;
    flex-shrink: 0;
  }

  .section--tasksFill {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .section--tasksFill .card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .card {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 14px;
    padding: 16px 16px 0 16px;
  }

  .tasksStreamHeader {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-shrink: 0;
    padding: 0 0 6px 0;
  }
  .tasksStreamHeader .sectionTitle {
    padding: 0;
  }
  .tasksStreamHeader .tasksCounter {
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.08em;
    opacity: 0.9;
  }

  /* Task view styles (mirrors live-task-view; used by other pages via shared class names) */
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
    overflow-y: auto;
    margin: 6px 0 0 0;
    padding: 0;
    box-sizing: border-box;
    -ms-overflow-style: none; /* IE/Edge */
    scrollbar-width: none; /* Firefox */
  }
  .section--tasksFill #scrollContainer {
    flex: 1;
    min-height: 0;
    margin-top: 4px;
  }
  /* Fade list content at the top of the viewport so rows vanish before the header line */
  #scrollContainer.scrollContainer--topTaskFade {
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.35) 14px,
      rgba(0, 0, 0, 0.85) 32px,
      #000 44px,
      #000 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.35) 14px,
      rgba(0, 0, 0, 0.85) 32px,
      black 44px,
      black 100%
    );
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }
  #scrollContainer::-webkit-scrollbar { display: none; }
  #scrollContainer .username {
    margin: 10px 0 0 0;
  }
  #scrollContainer .username:first-child {
    margin-top: 0;
  }
  ul { padding: 5px 0 1px 0; margin: 0; }
  li {
    list-style-type: none;
    display: flex;
    margin-bottom: 4px;
    letter-spacing: -0.02em;
  }

  /* Leaderboard section */
  .sectionTitle {
    font-weight: 700;
    letter-spacing: 0.08em;
    font-size: 14px;
    opacity: 0.9;
    padding: 0 0 6px 0;
  }
  .leaderboard {
    padding: 0 0 4px 0;
  }
  .lb-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
  }
  .lb-rank {
    min-width: 36px;
    font-weight: 700;
    opacity: 0.95;
  }
  .lb-name {
    flex: 1;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .lb-total {
    min-width: 4.5em;
    text-align: right;
    font-weight: 500;
    opacity: 0.9;
    font-variant-numeric: tabular-nums;
  }
  .empty {
    opacity: 0.8;
    padding: 6px 0;
  }
`;

const PageJS = `
const socket = io();

function safeGetScroll() {
  const el = document.getElementById('scrollContainer');
  return el ? el.scrollTop : 0;
}

function safeSetScroll(scrollTop) {
  const el = document.getElementById('scrollContainer');
  if (!el) return;
  el.scrollTop = scrollTop;
}

socket.on('update-live-stream-stats', (message) => {
  const prevScroll = safeGetScroll();
  document.body.innerHTML = message;
  safeSetScroll(prevScroll);
});

let scrollingDown = true;
let scrollInterval;

function listScroll() {
  const scrollContainer = document.getElementById('scrollContainer');
  if (!scrollContainer) return;

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
  clearInterval(scrollInterval);
  scrollInterval = setInterval(listScroll, 70);
}

function main() {
  startScroll();
}

window.onload = main;
`;

const PageLink = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700&display=swap" rel="stylesheet">';

module.exports = function(request, response, server) {
  console.log(`[${new Date().toISOString()}] /api/live-stream-stats`);

  socketServer.start(server);

  const baseURL = 'https://emmy.dog/';
  const url = new URL(request.url, baseURL);
  const fake = url.searchParams.get('fake') === '1';

  const body = generateLiveStreamStatsBody({ fake });

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    link: PageLink,
    title: 'Live Stream Stats',
  }));
};

