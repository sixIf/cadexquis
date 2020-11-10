import Discord from "discord.js"

module.exports = {
	name: 'args-info',
	description: 'Information about the arguments provided.!',
	args: true,
	guildOnly: true,
	aliases: ['test'],
	execute(msg: Discord.Message, args: Array<string>) {
		if (args[0] === 'foo') {
			return msg.channel.send('bar');
        }
        msg.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
	},
};