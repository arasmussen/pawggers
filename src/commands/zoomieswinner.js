const isSarah = require('../util/isSarah');
const { finishZoomiesChase } = require('../zoomies/chaseManager');

module.exports = function(context) {
  const { client, target } = context;

  if (!context?.['display-name'] ||
      !context?.['user-id']) {
    return;
  }

  const moderator = {
    id: context['user-id'],
    name: context['display-name'],
  };

  if (!isSarah(moderator.id)) {
    client.say(target, `Only Sarah can pick who caught Emmy.`);
    return;
  }

  const result = finishZoomiesChase({ client, target });

  if (!result.ok) {
    client.say(target, `No one's in the chase yet, or there isn't an active Zoomies.`);
  }
};
