const renderHTML = require('../util/renderHTML');
const socketServer = require('../managers/socket');

const PageCSS = `
  html, body, #container {
    width: 80%;
    height: 80%;
    margin: 0;
    padding: 0;
  }

  .anychart-credits {
    display: none;
  }
`;
const PageJS = `
  let chart = anychart.pie();

  const socket = io();
  socket.on('update-ttol-view', (message) => {
    chart.data(message);
    chart.draw();
  });

  // set the data
  // var data = [
  //     {x: "A", value: 4},
  //     {x: "B", value: 3},
  //     {x: "C", value: 8},
  // ];

  // create the chart
  chart.labels().format("{%x} - {%value}");
  chart.palette(["#E8B1BB", "#CE98D6", "#9E92D1"]);
  chart.startAngle(270);
  // chart.innerRadius("50%");

  // set the chart title
  chart.title("Two Truths, One Lie");

  // add the data
  // chart.data(data);

  // enable labels
  chart.labels(true);
  labels = chart.labels();

  // labels setting
  labels.fontColor('white');
  labels.fontSize("20px");
  labels.offsetY(10);

  // set legend position
  chart.legend().position("right");
  // set items layout
  chart.legend().itemsLayout("vertical");

  // display the chart in the container
  chart.container('container');
  chart.draw();
`;
const PageLink = '<script src="https://cdn.anychart.com/js/8.0.1/anychart-core.min.js"></script><script src="https://cdn.anychart.com/js/8.0.1/anychart-pie.min.js"></script>';

module.exports = function(request, response, server) {
  console.log(`[${new Date().toISOString()}] /api/live-ttol-view`);

  // start socket server
  socketServer.start(server);

  // generate body
  const body = '<div id="container"></div>';

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    link: PageLink,
    title: 'TTOL Live View',
  }));
}
