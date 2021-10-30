const http = require('http');

const server = http.createServer((request, response) => {
  console.log('got request');
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({
    data: 'Pawggers!',
  }));
});
server.listen(3000);