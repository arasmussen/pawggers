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
    font-family: 'Rubik', sans-serif;
    text-align: center;
    box-sizing: border-box;
    background: #d9a7c7; /* fallback for old browsers */
    background: -webkit-linear-gradient(340deg, #ffc3b5, #ffecdc); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(340deg, #ffc3b5, #ffecdc); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
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
    <h1>EmmyHQ Impact<span>2022</span></h1>
    <p>Documenting the champions from EmmyHQ who have gone above and beyond to give to those in need.</p>
    <h2>Stream for All Animals Dec 15-18, 2022</h2>
    <p>Your names here</p>
  `;

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    title: 'EmmyHQ Impact',
  }));
}
