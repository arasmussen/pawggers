const database = require('../database');
const generatePointsBody = require('../subs/generatePointsBody');
const SocketServer = require('./socket');

class SubManager {
  constructor() {
    SocketServer.subscribe('points-reward-checked', this.onTTOLDataRequest);
  }

  onTTOLDataRequest = (socket, data) => {
    const subRewardsTable = database.get('subRewards') || {};
    subRewardsTable[data.id] = data.checked;
    database.set('subRewards', subRewardsTable);

    const pointsBody = generatePointsBody();
    SocketServer.emit('update-points-view', pointsBody);
  }
}

module.exports = new SubManager();