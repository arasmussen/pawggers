const database = require('../database');
const getDay = require('../util/getDay');
const renderHTML = require('../util/renderHTML');

const PageCSS = `
  html, body, #container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: 50px 0;
    padding: 0;
    font-family: 'Fredoka', sans-serif;
    text-align: center;
    box-sizing: border-box;
  }

  .contentContainer {
    display: flex;
    padding: 0 40px;
  }

  .right {
    width: 100%;
    max-width: 660px;
    margin: 0 0 0 40px;
  }

  h1 {
    margin: 0 0 50px 0;
    font-size: 50px;
    letter-spacing: 0.1em;
    color: #0A2EDB;
  }

  h2 {
    text-transform: uppercase;
    font-size: 18px;
    margin: 0 0 20px 0;
    letter-spacing: 0.15em;
    color: #F05414;
    font-weight: 500;
  }

  p {
    font-size: 18px;
    color: #F05414;
    letter-spacing: 0.02em;
  }

  img {
    border-radius: 10px;
    margin: 0 0 50px 0;
  }

  iframe {
    max-width: 460px;
    position: sticky;
    top: 0;
  }

  .donation-note {
    width 100%;
    max-width: 300px;
    font-size: 14px;
  }

  @media only screen and (max-width: 800px) {
    iframe {
      position: relative;
    }

    .contentContainer {
      flex-direction: column;
      align-items: center;
    }
  }
`;
const PageJS = ``;

module.exports = function(request, response, server) {

  const body = `
    <h1>EMMYFEST <span>2024</span></h1>
    <div class="contentContainer">
      <div class="left">
        <h2>DONATE</h2>
        <div class="donation-note">Use your Twitch handle (unless anon) so Sarah can make sure you get your&nbsp;rewards</div>
        <iframe id='kofiframe' src='https://ko-fi.com/emmyfest/?hidefeed=true&widget=true&embed=true&preview=true' style='border:none;width:100%;padding:4px;' height='712' title='emmyfest'></iframe>
      </div>
      <div class="right">
        <h2>Milestones</h2>
        <img src="https://canny-assets.io/images/7beed8c0764c5beb1268ef7a1165e4de.png"</img>
        <h2>!tee</h2>
        <img src="https://canny-assets.io/images/c1f058c219499c0835a1101b85ce3aff.png"</img>
        <p>final shirt will be available at <a href="shop.emmy.dog">shop.emmy.dog</a></p>
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
    title: 'EMMYFEST 2022',
  }));
}
