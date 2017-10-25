const Discord = require('discord.js');
const config = require('./config');
const commands = require('./commands');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', commands);

client.login(config.discord.token);