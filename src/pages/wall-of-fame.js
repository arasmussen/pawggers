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

  .stream {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 50%;
    margin: 0 0 40px 0;
  }

  p {
    font-size: 16px;
    color: #333;
    max-width: 550px;
  }

  .dot {
    color: #d19588;
  }

  .date {
    margin: 0 0 20px 0;
    font-size: 14px;
    color: #d19588;
    font-weight: 400;
  }

  img {
    width: 700px;
    border-radius: 10px;
    margin: 0 0 30px 0;
  }
`;
const PageJS = ``;

module.exports = function(request, response, server) {

  const streamForAllAnimals = ['urbanbohemian','deekim','tiltify','SupaduckTV','jerklynn','Forelorne','Jayshoon','doaflipguy','TheBigJuicy89','HemiDex','sunfflawer','D21winters','lilsmurfyone','pranayyy','sassykatasstrophe','pixelatedsoul','toastwithjam_','MisstyMoo','heytherehan','dianeland','cerealdotcom','SeijiSoldier','NovaMoocakes','w0ngaccount','PlayItRay','theEvilChow','staymadge','saltedsaltine','kittskats','mightymur','lunar_mariya','Chebyyyyyy','ayo_frankie'];
  const emmyfest2022 = ['j3dg','pranayyy','sunfflawer','morgan_victoria','hedgehog166','QA_ninja','staymadge','AlviarinRhul','vlc999','lunar_marya','pmgomz','chrischin1','Its_Cheby','w0ngaccount','hemidex84','Partiick0331','RumpleStudy','mae_prol','thecrimsondd','timmychaan','greplogic','xangrykidx','ryantupo','YUMHUMS','XEPHAN0','johnkeiwo','ChaosForTheFly','Forelorne','jayshoon','rngie','Lilsmurfyone','saltedsaltine','miklmusic','jjlintag','Vubar_GMAT','razzyrl','davigator2','JurassicPugg','jwang956','antibuenosocialclub','ckL18','7kats','PlayItRay','inSAMniak','reanimagus','YakkyStudy','xkatie93'];
  const ukraine = ['Canny','inSAMniak','Kayla','Chris and Jordan','StayMadge','notCaitlyn','notImad','notRngie','greplogic','razzy','burbee','TheBigJuicy89','d4wnwolf','NotDruhvay','Razzy','Nori','w0ngaccount','Jhecht','RocketNine','HemiDex','breadgirl','philippe_pj','ChaosForTheFly','LunarMarya','Bauhaus_Banshee','NotJayshoon','Kevin','kittskats','Paolo','7kats','SoulDude','Alex','davigator2','Susanne','duck_027','AlviarinRhul','D21winters','Joe','yumhums','samuelspeak','Rob'];

  const body = `
    <h1>EmmyHQ Wall of Fame</h1>
    <p>Documenting the champions from EmmyHQ who have gone above and beyond to give to those in&nbsp;need.</p>
    <div class="stream">
      <h2>Stream for All Animals</h2>
      <p class="date">December 15-18, 2022</p>
      <img src="https://canny-assets.io/images/3103b69231d2b721aa84c9167576f757.png"</img>
      <p>${streamForAllAnimals.join("<span class='dot'> · </span>")}</p>
    </div>
    <div class="stream">
      <h2>EMMYFEST 2022 for F Cancer</h2>
      <p class="date">May 14, 2022</p>
      <img src="https://canny-assets.io/images/b5f754f6c7377bbf51f028bf621a8cb1.png"</img>
      <p>${emmyfest2022.join("<span class='dot'> · </span>")}</p>
    </div>
    <div class="stream">
      <h2>Project Hope for Ukraine</h2>
      <p class="date">March 8-13, 2022</p>
      <img src="https://canny-assets.io/images/9c7d70b3597e80a43b20972fbe903e2e.png"</img>
      <p>${ukraine.join("<span class='dot'> · </span>")}</p>
    </div>
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
