const commands = require('../commands');
const config = require('../config');
const request = require('request');
const tmi = require('tmi.js');
const util = require('util');

const asyncRequest = util.promisify(request);

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

    const commandParts = message.trim().split(' ');
    const command = commandParts[0];
    const commandHandler = commands[command];
    if (!commandHandler) {
      // ignore non-commands
      return;
    }

    console.log(`Twitch Command: ${command}`);
    context.client = Twitch.client;
    context.target = target;
    context.variables = commandParts.slice(1);
    commandHandler(context);
  },

  getUserByName: async function(username) {
    const response = await asyncRequest({
      method: 'GET',
      uri: 'https://api.twitch.tv/helix/users',
      qs: {
        login: username,
      },
      headers: {
        'Client-Id': config.api.clientID,
      },
      auth: {
        bearer: config.api.oauthToken,
      },
    });

    if (response.statusCode === 200) {
      const users = JSON.parse(response.body).data;
      if (users.length === 0) {
        return null;
      } else {
        return users[0];
      }
    } else {
      throw new Error('could not fetch user ' + response.statusCode);
    }
  },

  start: function() {
    const client = new tmi.client(Options);
    client.on('connected', Twitch.onConnected);
    client.on('message', Twitch.onMessage);
    client.connect().catch(console.error);
    Twitch.client = client;
  },
};


module.exports = Twitch;