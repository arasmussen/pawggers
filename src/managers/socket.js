const { Server } = require('socket.io');

class SocketServer {
  io = null;
  server = null;
  subscriptions = {};

  emit(event, message) {
    if (!this.io) {
      return;
    }

    this.io.emit(event, message);
  }

  onClientConnected(socket) {
    console.log('[socket] client connected');
    socket.on('disconnect', () => {
      console.log('[socket] client disconnected');
    });
    socket.onAny((event, ...args) => {
      if (!this.subscriptions[event]) {
        return;
      }

      this.subscriptions[event].forEach((subscription) => {
        subscription(socket, ...args);
      });
    });
  }

  start(server) {
    if (this.io) {
      return;
    }

    this.server = server;
    this.io = new Server(server);
    this.io.on('connection', this.onClientConnected.bind(this));
    console.log('[socket] server started');
  }

  subscribe(event, callback) {
    if (!this.subscriptions[event]) {
      this.subscriptions[event] = [];
    }

    if (this.subscriptions[event].includes(callback)) {
      return;
    }

    this.subscriptions[event].push(callback);
  }
}

module.exports = new SocketServer();