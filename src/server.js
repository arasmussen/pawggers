const database = require('./database');
const http = require('http');

var i = database.get('i');

class Server {
  start() {
    const server = http.createServer((request, response) => {
      if (request.url !== '/') {
        response.writeHead(404);
        response.end();
        return;
      }

      console.log('got request');
      database.set('i', i + 1);
      i = database.get('i');
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({
        data: i,
      }));
    });
    server.listen(3000);
  }
}

module.exports = new Server;