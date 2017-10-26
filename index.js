const Discord = require('discord.js');
const config = require('./config');
const commands = require('./commands');
const metadata = require('./metadata');
const client = new Discord.Client();

client.on('ready', () => {
  metadata.load();
  console.log('I am ready!');
});

metadata.on('update', data => {
  var str = data.artist;
  if(data.circle) {
    str += '(' + data.circle + ')';
  }
  str += ' - ' + data.title;
  client.user.setGame(str);
});

client.on('message', commands);

client.login(config.discord.token);