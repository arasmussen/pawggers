const chaseManager = require('../zoomies/chaseManager');

module.exports = function(data) {
  if (!data?.event?.user_id ||
      !data?.event?.user_name) {
    return;
  }

  const user = {
    id: data.event.user_id,
    name: data.event.user_name,
  };

  chaseManager.startAfterRedeem(user);
};
