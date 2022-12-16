const database = require('../database');
const getDay = require('../util/getDay');
const renderHTML = require('../util/renderHTML');

const PageCSS = `
  html, body, #container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 50px 0;;
    font-family: 'Rubik', sans-serif;
    text-align: center;
    box-sizing: border-box;
    background: #d9a7c7; /* fallback for old browsers */
    background: -webkit-linear-gradient(340deg, #ffc3b5, #ffecdc); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(340deg, #ffc3b5, #ffecdc); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  }

  h1 {
    margin: 0 0 10px 0;
    font-size: 50px;
    color: #fc7354;
  }

  h2 {
    text-transform: uppercase;
    font-size: 18px;
    margin: 50px 0 10px 0;
    letter-spacing: 0.03em;
    color: #333;
    font-weight: 500;
  }

  p {
    font-size: 18px;
    color: #333;
    max-width: 500px;
  }

  .date {
    margin: 0 0 30px 0;
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
    <h1>EmmyHQ Impact</h1>
    <p>Documenting the champions from EmmyHQ who have gone above and beyond to give to those in need.</p>
    <h2>Stream for All Animals Dec 15-18, 2022</h2>
    <p class="date">December 15-18, 2022</p>
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
