import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Shows the bot ping and uptime');

export async function execute(interaction) {
  try {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
    
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    
    // Calculate uptime
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const embed = new EmbedBuilder()
      .setColor('#336699')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Latency', value: `${latency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
        { name: 'Uptime', value: uptimeString, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Insight Bot • Ping Command' });

    await interaction.editReply({ content: '', embeds: [embed] });
  } catch (error) {
    logger.error('Error executing ping command:', error);
    await interaction.reply({
      content: '❌ An error occurred while executing this command.',
      ephemeral: true
    });
  }
}
