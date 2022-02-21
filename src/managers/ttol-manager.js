const database = require('../database');
const generateTTOLData = require('../ttol/generateTTOLData');
const SocketServer = require('./socket');

class TTOLManager {
  constructor() {
    SocketServer.subscribe('request-ttol-view', this.onTTOLDataRequest);
  }

  onTTOLDataRequest = (socket) => {
    const ttolData = generateTTOLData();
    socket.emit('update-ttol-view', ttolData);
  }
}

module.exports = new TTOLManager();