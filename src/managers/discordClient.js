const { Client, GatewayIntentBits } = require('discord.js');
const config = require('../config');

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

discordClient.login(config.discord.botToken);

module.exports = discordClient;