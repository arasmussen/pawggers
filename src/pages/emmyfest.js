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

  h1 {
    margin: 0 0 50px 0;
    font-size: 50px;
    letter-spacing: 0.1em;
    color: #8D46D7;
  }

  h2 {
    text-transform: uppercase;
    font-size: 20px;
    margin: 0 0 20px 0;
    letter-spacing: 0.1em;
    color: #8D46D7;
  }

  p {
    font-size: 18px;
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
    <h1>EMMYFEST 2022</h1>
    <h2>Milestones</h2>
    <img src="https://bit.ly/38RRj8g"</img>
    <h2>!tee</h2>
    <img src="https://cdn.discordapp.com/attachments/891339850828087436/971251629892440104/tee-mock.png"</img>
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
