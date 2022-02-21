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
  let chart;
  function createChart() {
    chart = anychart.pie();

    chart.labels().format("{%x} - {%value}");
    chart.palette(["#E8B1BB", "#CE98D6", "#9E92D1"]);
    chart.startAngle(270);
    // chart.innerRadius("50%");
    
    // set the chart title
    chart.title("Two Truths, One Lie");

    // initialize data
    // chart.data([
    //   {x: 'A', value: 1},
    //   {x: 'B', value: 2},
    //   {x: 'C', value: 3},
    // ]);
      
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
  }

  function updateChart(message) {
    if (!chart) {
      return;
    }

    chart.data(message);
    chart.draw();
  }

  function initSocket() {
    const socket = io();
    socket.on('update-ttol-view', (message) => {
      updateChart(message);
    });
    socket.on('connect', () => {
      socket.emit('request-ttol-view');
    });
  }

  function main() {
    createChart();
    initSocket();
  }

  // wait for DOM to load then do stuff
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(main, 0);
  } else {
    document.addEventListener('DOMContentLoaded', main);
  };
`;
const PageLink = '<script src="https://cdn.anychart.com/js/8.0.1/anychart-core.min.js"></script><script src="https://cdn.anychart.com/js/8.0.1/anychart-pie.min.js"></script>';

module.exports = function(request, response, server) {
  console.log(`[${new Date().toISOString()}] /api/live-ttol-view`);

  // start socket server
  socketServer.start(server);

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: '<div id="container"></div>',
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    link: PageLink,
    title: 'TTOL Live View',
  }));
}
