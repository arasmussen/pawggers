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
    font-size: 20px;
    margin: 50px 0 3px 0;
    letter-spacing: 0.03em;
    color: #333;
    font-weight: 600;
  }

  p {
    font-size: 18px;
    color: #333;
    max-width: 550px;
  }

  .date {
    margin: 0 0 20px 0;
    font-size: 14px;
    opacity: 0.5;
    font-weight: 400;
  }

  img {
    width: 700px;
    max-width: 50%;
    border-radius: 10px;
    margin: 0 0 30px 0;
  }
`;
const PageJS = ``;

module.exports = function(request, response, server) {

  const body = `
    <h1>EmmyHQ Wall of Fame</h1>
    <p>Documenting the champions from EmmyHQ who have gone above and beyond to give to those in&nbsp;need.</p>
    <h2>Stream for All Animals</h2>
    <p class="date">December 15-18, 2022</p>
    <img src="https://media.discordapp.net/attachments/891339850828087436/1053544835560247306/image.png?width=1138&height=639"</img>
    <p>urbanbohemian · deekim · tiltify · jayshoon · TheBigJuicy89 · HemiDex · sunfflawer · D21winters · lilsmurfyone · pranayyy · sassykatasstrophe · pixelatedsoul · toastwithjam_ · MisstyMoo · jerklynn · heytherehan · dianeland · cerealdotcom · NovaMoocakes · w0ngaccount · Forelorne · PlayItRay · theEvilChow · staymadge · saltedsaltine · kittskats · mightymur · lunar_mariya · Chebyyyyyy · ayo_frankie · doaflipguy · cbhl</p>
  `;

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    title: 'EmmyHQ Wall of Fame',
  }));
}
