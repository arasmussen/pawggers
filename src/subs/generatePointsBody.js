const database = require('../database');

const Rewards = [{
  name: 'tattoo',
  amount: 10,
  every: true,
}, {
  name: 'inkbox',
  amount: 25,
  every: true,
}];

module.exports = function generatePointsBody() {
  const subPointsTable = database.get('subPoints') || {};
  const subRewardsTable = database.get('subRewards') || {};
  const userTable = database.get('userTable') || {};

  const userIDs = Object.keys(subPointsTable);
  const users = userIDs.map((userID) => {
    return userTable[userID];
  });

  const body = users.map((user) => {
    const userPoints = subPointsTable[user.id];
    const userRewards = subRewardsTable || {};
    const rewardsPart = Rewards.map((reward) => {
      let rewardPart = '';
      let rewardPoints = userPoints;
      let rewardIndex = 1;
      while (rewardPoints >= reward.amount) {
        const checkboxID = `${user.id}_${reward.name}_${rewardIndex}`;
        rewardPart += `<div class="reward"><input type="checkbox" id="${checkboxID}" ${userRewards[checkboxID] ? 'checked' : ''} onchange="onCheckboxChecked(this)" />`;
        rewardPart += `<label for="${checkboxID}">${reward.name} ${rewardIndex++}</label></div>`;

        if (!reward.every) {
          break;
        }

        rewardPoints -= reward.amount;
      }
      return rewardPart;
    }).join('');
    return `<div class="userContainer"><div class="user">${user.name} x ${subPointsTable[user.id]}</div><div class="userRewards">${rewardsPart}</div></div>`;
  }).join('');

  return body;
}