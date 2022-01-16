const { Server } = require('socket.io');

class SocketServer {
  io = null;
  server = null;

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
}

module.exports = new SocketServer();