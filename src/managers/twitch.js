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

    const commandParts = message.trim().toLowerCase().split(' ');
    const command = commandParts[0];
    const commandHandler = commands[command];
    if (!commandHandler) {
      // ignore non-commands
      return;
    }

    console.log(`Twitch Command: ${command}`);
    context.client = client;
    context.target = target;
    context.variables = commandParts.slice(1);
    commandHandler(context);
  },
};

const client = new tmi.client(Options);
client.on('connected', Twitch.onConnected);
client.on('message', Twitch.onMessage);
client.connect().catch(console.error);

module.exports = Twitch;