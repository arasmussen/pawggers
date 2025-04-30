console.log('picksubwinner triggered');

const config = require('../config');
const discord = require('../managers/discord');
const isSarah = require('../util/isSarah');

module.exports = async function(context) {
  const { client, target, discordClient } = context;

client.say(target, `hello`);

  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };

  if (!isSarah(user.id)) {
    client.say(target, `Sorry, only Sarah can pick a winner.`);
    return;
  }

  const guildId = config.discord.guildId;
  const subRoleName = 'Shareholder';

  const guild = discordClient.guilds.cache.get(guildId);
  if (!guild) {
    client.say(target, `Couldn't find the Discord server.`);
    return;
  }

  try {
    console.log('Fetching members...');
    await guild.members.fetch(); // Ensure full member list is cached

console.log('Looking for role...');
    const role = guild.roles.cache.find(role => role.name === subRoleName);
    if (!role) {
      client.say(target, `Sub role '${subRoleName}' not found.`);
      return;
    }

    const eligible = guild.members.cache.filter(member =>
      member.roles.cache.has(role.id) && !member.user.bot
    );

    if (eligible.size === 0) {
      client.say(target, `No subs found`);
      return;
    }
console.log('Picking winner...');
    const winner = eligible.random();
    const winnerMention = `<${winner.id}>`;

    // Announce in Twitch chat
    client.say(target, `🎉 The winner is ${winner.user.username}!`);
console.log('Sending to Discord...');

    // Announce in Discord
    await discord.sendMessage('bot', `🎉 Giveaway winner: ${winnerMention}`);

  } catch (err) {
    console.error('Error picking sub winner:', err);
    client.say(target, `Something went wrong picking a winner.`);
  }
}