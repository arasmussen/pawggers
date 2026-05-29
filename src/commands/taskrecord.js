const { ClientRequest } = require('http');
const database = require('../database');
const { taskSay } = require('../tasks/taskUtils');

module.exports = function(context) {
  const { client, target } = context;

  // data validation
  if (!context?.['display-name'] ||
      !context?.['user-id']) {
    console.log('validation failed');
    return;
  }

  // update database
  let statsTable = database.get('statsTable') || {
    completedTaskRecord: 0,
  };

  taskSay(client, target, `The current completed task record is ${statsTable.completedTaskRecord}! emmmySurprised`);
}
