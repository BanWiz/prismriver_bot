var player = require('./player')

module.exports = function (message) {
    switch (message.content) {
        case '.prismriver play':
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
            break;
        case '.prismriver stop':
            if (!message.guild) {
                message.reply("I'm not playing in PM. I cannot...");
            } else if (!player.getInstanceList()[message.guild.id]) {
                message.reply("It looks like I don't play here. Cannot stop");
            } else {
                message.reply("Ok, stopping playing");
                player.stopInstance(message.guild.id);
            }
        case '.prismriver streams':
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