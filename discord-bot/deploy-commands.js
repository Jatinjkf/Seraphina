const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const commands = [];

// Load all command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command) {
        commands.push(command.data.toJSON());
        console.log(`✓ Loaded command: ${command.data.name}`);
    } else {
        console.warn(`⚠ Command at ${filePath} is missing "data" property`);
    }
}

// Create REST instance
const rest = new REST({ version: '10' }).setToken(config.discord.token);

// Deploy commands
(async () => {
    try {
        console.log(`\nStarting deployment of ${commands.length} slash commands...`);

        // Register commands globally (can take up to 1 hour to propagate)
        // For instant testing, use guild commands instead (see below)
        const data = await rest.put(
            Routes.applicationCommands(config.discord.clientId),
            { body: commands },
        );

        console.log(`✅ Successfully deployed ${data.length} slash commands globally!`);
        console.log('\nNote: Global commands may take up to 1 hour to appear.');
        console.log('For instant testing, use guild-specific deployment instead.\n');

        // Optional: Deploy to specific guild for instant testing
        // Uncomment and replace YOUR_GUILD_ID with your test server ID:
        /*
        const GUILD_ID = 'YOUR_GUILD_ID';
        const guildData = await rest.put(
          Routes.applicationGuildCommands(config.discord.clientId, GUILD_ID),
          { body: commands },
        );
        console.log(`✅ Deployed ${guildData.length} commands to guild ${GUILD_ID}`);
        */

    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
