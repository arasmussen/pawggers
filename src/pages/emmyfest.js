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
    background: #1C1420;
  }

  h1 {
    margin: 0 0 50px 0;
    font-size: 50px;
    letter-spacing: 0.1em;
    color: #CD62FF;
  }

  h2 {
    text-transform: uppercase;
    font-size: 18px;
    margin: 0 0 20px 0;
    letter-spacing: 0.15em;
    color: #E0D4EF;
    font-weight: 500;
  }

  p {
    font-size: 18px;
    color: #E0D4EF;
    letter-spacing: 0.02em;
  }

  img {
    max-width: 50%;
    border-radius: 10px;
    margin: 0 0 50px 0;
  }
`;
const PageJS = ``;

module.exports = function(request, response, server) {

  const body = `
    <h1>EMMYFEST <span>2022</span></h1>
    <h2>Milestones</h2>
    <img src="https://bit.ly/3KZCEF6"</img>
    <h2>!tee</h2>
    <img src="https://cdn.discordapp.com/attachments/891339850828087436/971260143880785950/tee-mock.png"</img>
    <p>If y'all want, we can look into selling these after :)</p>
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
