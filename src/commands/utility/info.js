import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';
import os from 'os';

export const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Shows detailed bot and system information');

export async function execute(interaction) {
  try {
    const client = interaction.client;
    const botUser = client.user;
    
    // Calculate uptime
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeString = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

    // Get guild count
    const guildCount = client.guilds.cache.size;
    
    // Get total users
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    // Get system info
    const nodeVersion = process.version;
    const platform = `${os.type()} ${os.release()} ${os.arch()}`;
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;
    
    // Get memory info
    const memUsage = process.memoryUsage();
    const heapUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
    const rss = (memUsage.rss / 1024 / 1024).toFixed(2);
    const external = (memUsage.external / 1024 / 1024).toFixed(2);
    const arrayBuffers = memUsage.arrayBuffers ? (memUsage.arrayBuffers / 1024 / 1024).toFixed(2) : 'N/A';

    // Get system uptime
    const sysUptime = os.uptime();
    const sysUptimeDays = Math.floor(sysUptime / 86400);
    const sysUptimeHours = Math.floor((sysUptime % 86400) / 3600);
    const sysUptimeMinutes = Math.floor((sysUptime % 3600) / 60);
    const sysUptimeSeconds = Math.floor(sysUptime % 60);
    const sysUptimeString = `${sysUptimeDays} hrs, ${sysUptimeHours} mins, ${sysUptimeMinutes} secs`;

    // Get load average
    const loadAverage = os.loadavg();
    const loadAvgString = `(${loadAverage[0].toFixed(2)}, ${loadAverage[1].toFixed(2)}, ${loadAverage[2].toFixed(2)})`;

    // Get bot creation date
    const botCreatedDate = botUser.createdAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Get Discord.js version
    const { version: discordVersion } = require('discord.js');
    
    // Count commands
    const commandCount = client.commands ? client.commands.size : 0;

    const embed = new EmbedBuilder()
      .setColor('#336699')
      .setTitle(`${botUser.username} Bot Information`)
      .setThumbnail(botUser.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'Bot Tag', value: `${botUser.tag}`, inline: true },
        { name: 'Bot ID', value: `${botUser.id}`, inline: true },
        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: 'Uptime', value: uptimeString, inline: true },
        { name: 'Users', value: totalUsers.toString(), inline: true },
        { name: 'Servers', value: guildCount.toString(), inline: true },
        { name: 'Commands', value: commandCount.toString(), inline: true },
        { name: 'Node.js Version', value: nodeVersion, inline: true },
        { name: 'Discord.js Version', value: `v${discordVersion}`, inline: true },
        { name: 'Platform', value: platform, inline: false },
        { name: 'System Uptime', value: sysUptimeString, inline: true },
        { name: 'CPU Model', value: `${cpuModel}`, inline: false },
        { name: 'CPU Cores', value: cpuCores.toString(), inline: true },
        { name: 'Load Average', value: loadAvgString, inline: true },
        { name: 'Memory Usage', value: `Heap Used: ${heapUsed} MB\nHeap Total: ${heapTotal} MB\nRSS: ${rss} MB\nExternal: ${external} MB\nArray Buffers: ${arrayBuffers} MB`, inline: false },
        { name: 'Shard Info', value: 'No Sharding', inline: false },
        { name: 'Created On', value: botCreatedDate, inline: false },
        { name: 'Requested by', value: `${interaction.user.tag} • ${new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`, inline: false }
      )
      .setFooter({ text: 'Powered by Insight' });

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Error executing info command:', error);
    await interaction.reply({
      content: '❌ An error occurred while executing this command.',
      ephemeral: true
    });
  }
}
