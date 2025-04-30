const config = require('../config');
const request = require('request');
const util = require('util');

const asyncRequest = util.promisify(request);

const WebhookIDs = {
	'bot' '1367158968241360936',
	'chat': '1367155736240721920',
	'cowork-chat': '971500686841892924',
	'journaling': '1191579201367715933',
};

const discord = {
	async sendMessage(channel, message) {
		const webhookID = WebhookIDs[channel];
		if (!webhookID) {
			throw new Error(`Could not find webhookID for ${channel}`);
		}

		const webhookToken = (
			config &&
			config.discord &&
			config.discord.webhooks &&
			config.discord.webhooks[channel] &&
			config.discord.webhooks[channel].token
		);
		if (!webhookToken) {
			throw new Error(`Could not find webhookToken for ${channel}`);
		}

		const webhookURL = `https://discord.com/api/webhooks/${webhookID}/${webhookToken}`;

		const response = await asyncRequest({
      method: 'POST',
      uri: webhookURL,
      json: {
        content: message,
      },
    });
	},
};

module.exports = discord;