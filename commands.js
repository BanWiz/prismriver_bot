var player = require('./player');

var commands = {
    play: function(message) {
        if (!message.guild) {
            message.reply('Sorry, I cannot play in private :frowning:');
        } else if (!message.member.voiceChannel) {
            message.reply('You are not in the voice channel');
        } else {
            player.addInstance(message.member.voiceChannel, (success) => {
                if (success) {
                    message.reply('Starting playing');
                } else {
                    message.reply("Looks like I'm already playing here");
                }
            })
        }
    },
    stop: function(message) {
        if (!message.guild) {
            message.reply("I'm not playing in PM. I cannot...");
        } else if (!player.getInstanceList()[message.guild.id]) {
            message.reply("It looks like I don't play here. Cannot stop");
        } else {
            message.reply("Ok, stopping playing");
            player.stopInstance(message.guild.id);
        }
    },
    streams: function(message) {
        var list = player.getInstanceList();
        var num = 0;
        for (var key in list) {
            num++;
        }
        if (num) {
            message.reply("I am currently playing on " + num + " server" + (num % 10 === 1 && num % 100 !== 11 ? "" : 's'));
        } else {
            message.reply("I don't play anywhere now");
        }
    }
}

function checkPrefix(message) {
    const prefix = '.prismriver ';
    if(!message.content.startsWith(prefix)) {
        return false;
    }
    return message.content.substring(prefix.length);
}

module.exports = function (message) {
    var params = checkPrefix(message);
    if(!params) {
        return;
    }
    params = params.split(' ');
    var command = params.shift();
    if(commands[command]) {
        commands[command](message, params);
    }
}