const renderHTML = require('../util/renderHTML');

const PageCSS = `
  html {
    scroll-behavior: smooth;
  }

  html, body, #container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 50px 20px 80px;
    font-family: 'Rubik', sans-serif;
    box-sizing: border-box;
    background: #d9a7c7;
    background: -webkit-linear-gradient(340deg, #ffc3b5, #ffecdc);
    background: linear-gradient(340deg, #ffc3b5, #ffecdc);
  }

  .guide-header {
    width: 100%;
    max-width: 720px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .guide-layout {
    display: flex;
    gap: 32px;
    width: 100%;
    max-width: 720px;
    align-items: flex-start;
  }

  .toc-nav {
    flex-shrink: 0;
    width: 140px;
    position: sticky;
    top: 24px;
    padding: 0;
  }

  .toc-nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .toc-nav li {
    margin: 0 0 8px 0;
  }

  .toc-nav a {
    color: #666;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 200ms ease;
  }

  .toc-nav a:hover {
    color: #fc7354;
  }

  @media (max-width: 768px) {
    .toc-nav {
      display: none;
    }
  }

  .guide-content {
    flex: 1;
    min-width: 0;
    max-width: 520px;
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h1 {
    margin: 0 0 8px 0;
    font-size: 42px;
    text-align: left;
    color: #fc7354;
    letter-spacing: 0.02em;
  }

  .intro {
    text-align: left;
    font-size: 15px;
    color: #444;
    line-height: 1.5;
    margin-bottom: 36px;
    max-width: 360px;
  }

  .section-card {
    width: 100%;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    scroll-margin-top: 24px;
  }

  .section-card + .section-card {
    margin-top: 24px;
  }

  .schedule-line {
    margin: 0 0 8px 0;
    font-size: 15px;
    color: #333;
    line-height: 1.4;
  }

  .schedule-links {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .schedule-links a {
    color: #fc7354;
    font-weight: 500;
    text-decoration: none;
  }

  .schedule-links a:hover {
    text-decoration: underline;
  }

  .section-card h2 {
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 0.08em;
    color: #d19588;
    margin: 0 0 8px 0;
    font-weight: 600;
    text-align: left;
  }

  .section-intro {
    font-size: 15px;
    color: #444;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .command-block {
    margin: 8px 0 0 0;
    padding: 10px 12px;
    border-radius: 8px;
    background: white;
  }

  .command-line {
    font-size: 15px;
    margin-bottom: 2px;
  }

  .command-line .cmd {
    font-family: monospace;
    font-weight: 600;
    color: #fc7354;
  }

  .command-line .aliases {
    color:rgb(206, 75, 38);
    opacity: 0.6;
    font-size: 14px;
  }

  .command-desc {
    font-size: 14px;
    color: #444;
    line-height: 1.4;
    margin-left: 0;
    padding-left: 0;
  }

  .back-link {
    position: absolute;
    top: 20px;
    left: 20px;
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: color 200ms ease;
  }

  .back-link:hover {
    color: #fc7354;
  }
`;

module.exports = function (request, response, server) {
  const body = `
    <a class="back-link" href="/">Home</a>
    <div class="guide-header">
      <h1>EmmyHQ Guide</h1>
      <p class="intro">Welcome to EmmyHQ! Here are some things to help you participate in&nbsp;streams.</p>
    </div>
    <div class="guide-layout">
      <nav class="toc-nav" aria-label="Page contents">
        <ul>
          <li><a href="#cowork-schedule">Cowork schedule</a></li>
          <li><a href="#tasks">Tasks</a></li>
          <li><a href="#pawggers">Pawggers</a></li>
          <li><a href="#song-queue">Song queue</a></li>
          <li><a href="#hydration">Hydration</a></li>
          <li><a href="#vip">VIP</a></li>
        </ul>
      </nav>
      <div class="guide-content">
      <div class="section-card" id="cowork-schedule">
        <h2>Cowork schedule</h2>
        <p class="schedule-line"><strong>Twitch:</strong> Tuesday, Wednesday, Friday at 7:15&nbsp;PT <span id="twitch-local-time"></span></p>
        <p class="schedule-line"><strong>Discord:</strong> Monday and Thursday, muted cowork—drop in and focus with us.</p>
        <div class="schedule-links">
          <a href="https://www.twitch.tv/xhumming" target="_blank" rel="noopener noreferrer">Twitch</a>
          <a href="https://discord.gg/jPBShcbfrV" target="_blank" rel="noopener noreferrer">Discord</a>
        </div>
      </div>

      <div class="section-card" id="tasks">
        <h2>Tasks</h2>
        <p class="section-intro">We have our own task bot. Here are the commands you should know to track your tasks. If you finish at least 3 tasks in a stream, you'll get 2k pawggers at the end of the day. Let's be&nbsp;productive!</p>
        <div class="command-block">
        <div class="command-line"><span class="cmd">!task</span> <span class="aliases">(!add, !addtask, !c, !check, !mytask, !now, !taskadd, !taska, !todo)</span></div>
        <div class="command-desc">Add a task by doing !task [task name] or view your current task and how long you've been working on&nbsp;it.</div>
      </div>
      <div class="command-block">
        <div class="command-line"><span class="cmd">!next</span></div>
        <div class="command-desc">Complete your current task and add your next one (e.g. !next my next&nbsp;task).</div>
      </div>
      <div class="command-block">
        <div class="command-line"><span class="cmd">!done</span> <span class="aliases">(!complete, !donetask, !finished, !taskd, !taskdone)</span></div>
        <div class="command-desc">Mark your current task&nbsp;complete.</div>
      </div>
      <div class="command-block">
        <div class="command-line"><span class="cmd">!edit</span> <span class="aliases">(!edittask, !taskedit)</span></div>
        <div class="command-desc">Change your current&nbsp;task.</div>
      </div>
      <div class="command-block">
        <div class="command-line"><span class="cmd">!delete</span> <span class="aliases">(!removetask)</span></div>
        <div class="command-desc">Remove your active task.</div>
      </div>
      <div class="command-block">
        <div class="command-line"><span class="cmd">!log</span></div>
        <div class="command-desc">Log one or more completed tasks (e.g. !log task1;&nbsp;task2).</div>
      </div>
      <div class="command-block">
        <div class="command-line"><span class="cmd">!summary</span></div>
        <div class="command-desc">View your task summary: completed tasks today and your current&nbsp;task.</div>
      </div>
      <div class="command-block">
        <div class="command-line"><span class="cmd">!taskrecord</span></div>
        <div class="command-desc">View the current EmmyHQ daily completed-task&nbsp;record.</div>
      </div>
      </div>

      <div class="section-card" id="pawggers">
        <h2>Pawggers</h2>
        <p class="section-intro">Pawggers are the in-stream currency that determine who gets a shiny VIP badge next month. You earn pawggers by doing channel redeems (2k redeem = 2k pawggers), winning games, digging, being an early bird (1st: 2k, 2nd: 1k, 3rd: 500), completing 3 !tasks per day, hydrating sarah, and winning on wheel spins. We pick new VIPs on the last stream of each&nbsp;month.</p>
        <div class="command-block">
        <div class="command-line"><span class="cmd">!pawggers</span> <span class="aliases">(!points)</span></div>
        <div class="command-desc">Check how many pawggers you&nbsp;have.</div>
      </div>
      <div class="command-block">
        <div class="command-line"><span class="cmd">!leaderboard</span> <span class="aliases">(!lb, !top)</span></div>
        <div class="command-desc">View the top pawggers holders this month who are in the running for VIP at the end of the&nbsp;month.</div>
      </div>
      <div class="command-block">
        <div class="command-line"><span class="cmd">!pirates</span></div>
        <div class="command-desc">See how many pawggers pirates have looted this&nbsp;month.</div>
      </div>
      </div>

      <div class="section-card" id="song-queue">
        <h2>Song queue</h2>
        <p class="section-intro">We usually play lofi music on </p>
      </div>

      <div class="section-card" id="hydration">
        <h2>Hydration</h2>
        <p class="section-intro">Redeem the Hydrate channel reward (in the rewards menu) to remind Sarah to drink water. Everyone who hydrates during the stream gets logged for the day. At the end of the stream, Sarah runs !tyhydrators and thanks everyone who hydrated—and each of you gets 2,000&nbsp;pawggers.</p>
      </div>

      <div class="section-card" id="vip">
        <h2>VIP</h2>
        <p class="section-intro">VIP is our monthly shout-out for the top pawggers holders. Your pawggers total resets each month. We look at the leaderboard (!leaderboard) and pick new VIPs on the last stream of the month—so the more you participate (tasks, redeems, digging, hydrating, wheel spins, etc.), the better your shot at getting a shiny VIP badge next&nbsp;month.</p>
      </div>
      </div>
    </div>
  `;

  const pageJS = `
    window.addEventListener('load', function() {
      if (window.location.hash) {
        window.scrollTo(0, 0);
        window.history.replaceState(null, '', window.location.pathname);
      }
      var el = document.getElementById('twitch-local-time');
      if (el) {
        var laStr = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'short' });
        var isPDT = laStr.indexOf('PDT') !== -1;
        var utcHour = isPDT ? 2 : 3;
        var d = new Date(Date.UTC(2025, 1, 4, utcHour, 15, 0));
        var inLocal = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
        el.textContent = '(' + inLocal + ' in your timezone)';
      }
    });
  `;

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body,
    css: PageCSS,
    js: pageJS,
    title: 'EmmyHQ Guide',
  }));
};
