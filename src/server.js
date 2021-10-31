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
        resolve(JSON.parse(body));
      });
    });
  }

  requestHandler = async (request, response) => {
    if (request.method === 'POST') {
      const data = await this.getPostData(request);
      request.postData = data;
      console.log('post data');
      console.log(data);
    }

    if (request.url === '/api/reward-redeemed') {
      request.writeHead(200, { 'Content-Type': 'application/json' });
      request.end(request.postData.challenge);
      return;
    } else {
      response.writeHead(404);
      response.end();
      return;
    }
  }

  start() {
    const server = http.createServer(this.requestHandler);
    server.listen(3000);
  }
}

module.exports = new Server;