const http = require('http');
const { URL } = require('url');

const socket = require('./managers/socket');
require('./managers/ttol-manager');
const twitch = require('./managers/twitch');

const Endpoints = {
  '/emmyfest': require('./pages/emmyfest'),
  '/api/channel-gift-sub': require('./endpoints/channel-gift-sub'),
  '/api/channel-new-sub': require('./endpoints/channel-new-sub'),
  '/api/channel-resub': require('./endpoints/channel-resub'),
  '/api/emmyfest-points': require('./pages/emmyfest-points-page'),
  '/api/emmyfest-spins': require('./pages/emmyfest-spins-page'),
  '/api/giveaway-entries': require('./pages/giveaway-entries-page'),
  '/api/live-task-view': require('./endpoints/live-task-view'),
  '/api/live-ttol-view': require('./endpoints/live-ttol-view'),
  '/api/reward-redeemed': require('./endpoints/reward-redeemed'),
  '/api/reward-updated': require('./endpoints/reward-updated'),
};

class Server {
  server = null;

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
        if (body === '') {
          resolve({});
          return;
        }

        let parsedBody;
        try {
          parsedBody = JSON.parse(body);
        } catch (error) {
          parsedBody = {};
        }

        resolve(parsedBody);
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
      endpoint(request, response, this.server);
      return;
    }

    response.writeHead(404);
    response.end();
  }

  start() {
    twitch.start();

    this.server = http.createServer(this.requestHandler.bind(this));
    this.server.listen(3000);

    socket.start(this.server);
  }
}

module.exports = new Server;
