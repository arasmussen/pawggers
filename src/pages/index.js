const database = require('../database');
const getDay = require('../util/getDay');
const renderHTML = require('../util/renderHTML');

const PageCSS = `

  html, body, #container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-family: 'Rubik', sans-serif;
    text-align: center;
    box-sizing: border-box;
    background: #d9a7c7; /* fallback for old browsers */
    background: -webkit-linear-gradient(340deg, #ffc3b5, #ffecdc); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(340deg, #ffc3b5, #ffecdc); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  }

  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 0 100px 0;
    padding: 100px 0 0 0;
    width: 320px;
  }

  h1 {
    margin: 0 0 40px 0;
    font-size: 50px;
    letter-spacing: 0.05em;
    color: #fc7354;
  }

  h2 {
    text-transform: uppercase;
    font-size: 18px;
    margin: 0 0 20px 0;
    letter-spacing: 0.05em;
    color: #333;
    font-weight: 500;
  }

  .links {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 30px 0 0 0;
  }

  .link {
    width: 100%;
    background: white;
    color: #333;
    padding: 11px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 300ms ease-in-out;
    margin: 6px 0;
    font-weight: 500;
    font-size: 15px;
  }

  .link:hover {
    color: #fc7354;
  }

  a {
    color: #333;
    text-decoration: none;
    transition: all 200ms ease-in-out;
  }

  p {
    font-size: 15px;
    color: #333;
    letter-spacing: 0.02em;
    line-height: 18px;
  }

  .section-paragraph {
    margin: 40px 0 20px 0;
  }

  .logo {
    width: 110px;
    margin: 0 0 20px 0;
  }

  .playlists {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .playlist {
    position: relative;
    width: 155px;
    display: flex;
    flex-direction: column;
    margin: 0 0 10px 0;
  }

  .playlist img {
    -webkit-filter: grayscale(30%) brightness(90%); /* Safari 6.0 - 9.0 */
    filter: grayscale(30%) brightness(90%);
    border-radius: 10px;
    transition: all 200ms ease-in-out;
  }

  .playlist:hover img {
    -webkit-filter: grayscale(0%); /* Safari 6.0 - 9.0 */
    filter: grayscale(0%);
  }

  .playlist p {
    position: absolute;
    width: 100%;
    padding: 0 10px;
    bottom: 10px;
    text-align: center;
    color: white;
    text-shadow: 0 2px 3px #000;
  }
`;
const PageJS = ``;
const PageLink = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700&display=swap" rel="stylesheet">';

module.exports = function(request, response, server) {

  const body = `
    <div class="main-container">
      <img class="logo" src="https://canny-assets.io/images/8964534ef3a80116f8be77f4ad336c94.png" />
      <p>cowork/study streams with sarah&nbsp;&&nbsp;emmy</p>
      <p>tues, wed, fri · 10:15 ET</p>
      <div class="links">
          <a target="_blank" class="link" href="https://twitch.tv/xhumming">work/study streams</a>
          <a class="link" href="/dashboard">emmyHQ dashboard</a>
          <a class="link" href="https://emmy.dog/wall-of-fame">wall of fame</a>
          <a target="_blank" class="link" href="https://shop.emmy.dog">rep our merch</a>
          <a target="_blank" class="link" href="https://discord.gg/SVKHb6Xfqp">join our discord</a>
          <a target="_blank" class="link" href="https://www.twitch.tv/team/emmyhq">emmyHQ streamers</a>
          <a target="_blank" class="link" href="https://www.patreon.com/hums">sarah's audio diary</a>
          <a target="_blank" class="link" href="https://ghostfox.studio">commission sarah</a>
      </div>
      <p class="section-paragraph">♪ playlists we listen to on stream ♫</p>
      <div class="playlists">
        <a class="playlist" target="_blank" href="https://open.spotify.com/playlist/0EdpsOs97X9EUipCJKmWJV?si=6712d83b9a1b4da1">
          <img src="https://i.scdn.co/image/ab67706c0000bebbede67dd3942faf14ad3d2669" />
          <p class="name">sarah's stream&nbsp;jams</p>
        </a>
        <a class="playlist" target="_blank" href="https://open.spotify.com/playlist/1TNYJrsNfNxfOpYAxqqMYq?si=c70896b2192e4c8d">
          <img src="https://i.scdn.co/image/ab67706c0000da8437d68f9312e8e41bcfaa4d96" />
          <p class="name">pop culture lofi&nbsp;beats</p>
        </a>
        <a class="playlist" target="_blank" href="https://open.spotify.com/playlist/0yuaNr2261ynXYz1MYO9Tm?si=ef0f6d81245b4727">
          <img src="https://i.scdn.co/image/ab67706c0000da84aeca508f7469506a3cd2d5d6" />
          <p class="name">vibin'</p>
        </a>
        <a class="playlist" target="_blank" href="https://open.spotify.com/playlist/469T18wyfKxFg8aGaNbHE1?si=7f7ec94e9f7d4c60">
          <img src="https://i.scdn.co/image/ab67706c0000da8422da83de42d2be0564ea5ecf" />
          <p class="name">fresh</p>
        </a>
        <a class="playlist" target="_blank" href="https://open.spotify.com/playlist/3pSNie4iZR5jtb410C0W53?si=5754b6afb36845c6">
          <img src="https://mosaic.scdn.co/300/ab67616d00001e021260c9a4d42b2615c9f67bb0ab67616d00001e02131cf6fcb170cda7a7956227ab67616d00001e022f74587e89fe803fa61d748eab67616d00001e0289a8fc641c956dc899c0b168" />
          <p class="name">kbop stan</p>
        </a>
        <a class="playlist" target="_blank" href="https://open.spotify.com/playlist/1J2au2gmjucHtDOFz4Dsac?si=8eca289f682748f1">
          <img src="https://mosaic.scdn.co/300/ab67616d00001e0250561199d70bffacb1959021ab67616d00001e029c6590331c9a43a664a8af7bab67616d00001e02af7d03372ecfcec2b160e81dab67616d00001e02e54976b5d8f367ebeebaba8a" />
          <p class="name">mornin</p>
        </a>

        
      </div>
    </div>
  `;

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    title: 'EMMYHQ',
  }));
}
