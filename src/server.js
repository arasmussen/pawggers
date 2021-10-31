const database = require('./database');
const http = require('http');

class Server {
  async getPostData(request) { 
    return new Promise((resolve, reject) => {
      var body = '';
      request.on('data', (data) => {
        body += data;
        if (body.length > 1000000) {
          request.connection.destroy();
          reject();
        }
      });
      request.on('end', () => {
        resolve(body);
      });
    });
  }

  requestHandler = async (request, response) => {
    if (request.method === 'POST') {
      const data = await this.getPostData(request);
      console.log('post data');
      console.log(data);
    }
    if (request.url !== '/') {
      response.writeHead(404);
      response.end();
      return;
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
      foo: 'bar',
    }));
  }

  start() {
    const server = http.createServer(this.requestHandler);
    server.listen(3000);
  }
}

module.exports = new Server;