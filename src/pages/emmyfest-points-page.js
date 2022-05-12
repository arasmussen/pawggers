const database = require('../database');

const renderHTML = require('../util/renderHTML');

const PageCSS = `
  html, body, #container {
    width: 100%;
    height: 100%;
    font-family: 'Red Hat Mono', sans-serif;
    margin: 0;
    padding: 20px;
  }

  .userContainer {
    display: flex;
    margin: 0 0 5px 0;
    padding: 5px 10px;
    width: 100%;
    border-radius: 10px;
  }

  .userContainer:nth-child(1) {
    background: #e6e6e6;
  }

  .user {
    margin: 0 10px 0 0;
    white-space: nowrap;
  }

  .userRewards {
    display: flex;
    flex-wrap: wrap;
  }

  .reward {
    display: flex;
  }

  label {
    margin: 0 10px 0 0;
    white-space: nowrap;
  }
`;
const PageJS = ``;

const Rewards = [{
  name: 'tattoo',
  amount: 10,
  every: true,
}, {
  name: 'inkbox',
  amount: 25,
  every: true,
}];

module.exports = function(request, response, server) {
  const subPointsTable = database.get('subPoints') || {};
  const subRewardsTable = database.get('subRewards') || {};
  const userTable = database.get('userTable') || {};

  const userIDs = Object.keys(subPointsTable);
  const users = userIDs.map((userID) => {
    return userTable[userID];
  });

  const body = users.map((user) => {
    const userPoints = subPointsTable[user.id];
    const userRewards = subRewardsTable[user.id] || {};
    const rewardsPart = Rewards.map((reward) => {
      let rewardPart = '';
      let rewardPoints = userPoints;
      let rewardIndex = 1;
      while (rewardPoints >= reward.amount) {
        const rewardID = `${reward.name}_${rewardIndex}`;
        const checkboxID = `${user.id}_${rewardID}`;
        rewardPart += `<div class="reward"><input type="checkbox" id="${checkboxID}" ${userRewards[rewardID] ? 'checked' : ''} />`;
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

  // respond
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(renderHTML({
    body: `${body}`,
    css: PageCSS,
    includeSocketIO: true,
    js: PageJS,
    title: 'EMMYFEST Points',
  }));
}

