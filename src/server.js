const http = require('http');
const { URL } = require('url');

const Endpoints = {
  '/api/reward-redeemed': require('./endpoints/reward-redeemed'),
};

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
      request.postData = await this.getPostData(request);
    }

    const baseURL = 'https://emmy.dog/';
    const url = new URL(request.url, baseURL);

    const endpoint = Endpoints[url.pathname];
    if (endpoint) {
      endpoint(request, response);
      return;
    }

    response.writeHead(404);
    response.end();
  }

  start() {
    const server = http.createServer(this.requestHandler);
    server.listen(3000);
  }
}

module.exports = new Server;