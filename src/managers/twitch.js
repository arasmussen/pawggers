const commands = require('../commands');
const config = require('../config');
const tmi = require('tmi.js');

const Options = {
  connection: {
    reconnect: true,
    secure: true,
  },
  channels: [
    config.channel.name,
  ],
  identity: {
    username: config.bot.username,
    password: config.bot.oauthToken,
  },
};

const Twitch = {
  onConnected: function(address, port) {
    console.log(`Twitch: Connected on ${address}:${port}`);
  },

  onMessage: function (target, context, message, self) {
    console.log(`Twitch Message: ${message}`);

    if (self) {
      // ignore messages from bot
      return;
    }

    const command = message.trim().toLowerCase();
    const commandHandler = commands[command];
    if (!commandHandler) {
      // ignore non-commands
      return;
    }

    console.log(`Twitch Command: ${command}`);
    context.client = client;
    context.target = target;
    commandHandler(context);
  },
};

const client = new tmi.client(Options);
client.on('connected', Twitch.onConnected);
client.on('message', Twitch.onMessage);
client.connect().catch(console.error);

module.exports = Twitch;