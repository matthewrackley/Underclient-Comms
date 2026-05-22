import { patchUrlMappings } from '@discord/embedded-app-sdk';
import api from './api'
import authorizeClient from './auth';
import { handleClientDoc } from './api';

let client = null as Discord | null;

async function setGuildChannels (discord: Discord): Promise<void> {
  const channels = Object.values(discord.guild.channels);
  discord.channel = channels.find(c => c.id === discord.sdk.channelId) as Channel;
  for (let i = 0; i < channels.length; i++) {
    const channelId = channels[i].id;
    discord.guild.channels[channelId] = channels[i];
    delete discord.guild.channels[i as any];
  }
  discord.guild.channels[discord.sdk.channelId as any] = discord.channel;
  await handleClientDoc({ data: discord.guild, guildId: discord.guild.id, discord, method: "POST" });
}
async function initDiscord () {
  const response = await fetch('/api/env');
  const env = await response.json() as { redirect_uri: string; discord_client_id: string; firebase_auth_domain: string };
  if (client !== null) return client;
  patchUrlMappings([{
    prefix: "/db",
    target: env.firebase_auth_domain,
  }, {
    prefix: "/",
    target: env.redirect_uri
    }]);
  client = await authorizeClient();
  if (!client.auth.user.guilds) {
    client.auth.user.guilds = {};
  }
  let guilds: PartialGuild[] = [];
  if (client.sdk.channelId != null && client.sdk.guildId != null) {
    guilds = await api.getGuilds(client);
    client.guild = await api.getGuild(client, client.sdk.guildId);
    await setGuildChannels(client);
  }
  if (guilds) {
    for (let i = 0; i < guilds.length; i++) {
      const guildId = guilds[i].id;
      const guild = guilds[i];
      client.auth.user.guilds[guildId] = guild;
    }
  }
  client.auth.expires = new Date(client.auth.expires).getTime();
  await handleClientDoc({ data: client.auth, root: "users", userId: client.auth.user.id, discord: client, method: "POST" });
  return client;
};
export async function waitForSDK (timeoutMs = 30000, intervalMs = 500) {
  const start = Date.now();
  while (client === null) {
    if (Date.now() - start > timeoutMs) return null;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return client;
}
export const discord = client;
export default initDiscord;
