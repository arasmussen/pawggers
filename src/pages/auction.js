const database = require('../database');
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
    flex-direction: column;
    padding: 0 40px;
    align-items: center;
  }

  .right {
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

  .sheetLink {
    background: #FFE3D4;
    text-decoration: none;
    border-radius: 10px;
    width: 580px;
    margin: 0 0 10px 0;
    padding: 20px 0;
    letter-spacing: 1px;
    font-weight: 500;
    color: #F05414;
  }

  .sheetLink:hover {
    background: #FFE0D0;
  }

  iframe {
    max-width: 800;
    top: 0;
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
    <h1>EMMYFEST AUCTION</h1>
    <div class="contentContainer">
      <a class="sheetLink" href="https://docs.google.com/spreadsheets/d/1_JRHc7j9UhCs_xJSdJZtfX1AvHWQNxHPrnh12P02cF4/edit?usp=sharing" target="_blank">VIEW ITEMS & TOP BIDS</a>

      <!-- <iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQSU2I5DdcpfHWqXhtARE61y644Brc9L-LUFQ9oi914PdkI1ScB4ebv1CwdIXjSuVx5DGyi6IuFRspl/pubhtml?gid=0&amp;single=true&amp;widget=true&amp;headers=false" width="580" height="500" frameborder="0" marginheight="0" marginwidth="0"></iframe>-->
      
      <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdMD2DLr_GuBKCsyBitWKimWP6I0HOOSleZUPGyKuL_N4V33A/viewform?embedded=true" width="640" height="1148" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
      
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
