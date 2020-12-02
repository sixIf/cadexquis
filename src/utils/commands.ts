import { Collection } from 'discord.js';
import fs from 'fs'
import path from 'path'
import { DiscordCommand } from '../config/literals/discordCommand';

/**
 * Setup available commands found in
 * ./commands folder
 */
const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands')).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
const commands = new Collection<string, DiscordCommand>();

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.set(command.name, command);
}

export default commands;