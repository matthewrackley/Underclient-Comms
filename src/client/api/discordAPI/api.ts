import discordApi from "./fetch";

function unwrapResponse<T>(response: APIResponse<T>, context: string): T {
  if (!response.ok) {
    throw new Error(`${context}: ${response.error}`);
  }
  return response.data;
}

type GetGuildsFn = (discord: Discord) => Promise<PartialGuild[]>;
type GetGuildFn = (discord: Discord, guildId: Snowflake) => Promise<Guild>;
type GetGuildPreviewFn = (discord: Discord, guildId: Snowflake) => Promise<DiscordAPI.GuildPreview>;
type GetGuildMembersFn = (discord: Discord, guildId: Snowflake, userId?: Snowflake) => Promise<DiscordAPI.GuildMember[] | DiscordAPI.GuildMember>;
type SearchGuildMembersFn = (discord: Discord, guildId: Snowflake, query: string) => Promise<DiscordAPI.GuildMember[]>;
type GetGuildRolesFn = (discord: Discord, guildId: Snowflake, roleId?: Snowflake) => Promise<DiscordAPI.Role[] | DiscordAPI.Role>;
type GetGuildRoleMemberCountsFn = (discord: Discord, guildId: Snowflake) => Promise<Record<Snowflake, number>>;
type GetChannelFn = (discord: Discord, id: Snowflake) => Promise<DiscordAPI.Channel>;
type GetChannelMessagesFn = (discord: Discord, channelId: Snowflake, messageId?: Snowflake) => Promise<DiscordAPI.Message[] | DiscordAPI.Message>;
type GetChannelsFn = (discord: Discord, id: Snowflake) => Promise<Channel[]>;
type GetVoiceStateFn = (discord: Discord, guildId: Snowflake, userId?: Snowflake) => Promise<DiscordAPI.VoiceState>;
type GetActivityInstanceFn = (discord: Discord, applicationId: Snowflake, instanceId: Snowflake) => Promise<ActivityInstance>;

interface Guilds {
  getGuild (discord: Discord, id?: Snowflake): Promise<Guild>;
  getGuilds (discord: Discord): Promise<PartialGuild[]>;
  getChannel (discord: Discord, id: Snowflake): Promise<DiscordAPI.Channel>;
  getChannels (discord: Discord, id: Snowflake): Promise<Channel[]>;
  getVoiceState (discord: Discord, guildId: Snowflake, userId?: Snowflake): Promise<DiscordAPI.VoiceState>;
  getGuildPreview (discord: Discord, guildId: Snowflake): Promise<DiscordAPI.GuildPreview>;
  getGuildMembers (discord: Discord, guildId: Snowflake, userId?: Snowflake): Promise<DiscordAPI.GuildMember[] | DiscordAPI.GuildMember>;
  searchGuildMembers (discord: Discord, guildId: Snowflake, query: string): Promise<DiscordAPI.GuildMember[]>;
  getGuildRoles (discord: Discord, guildId: Snowflake, roleId?: Snowflake): Promise<DiscordAPI.Role[] | DiscordAPI.Role>;
  getGuildRoleMemberCounts (discord: Discord, guildId: Snowflake): Promise<Record<Snowflake, number>>;
  getChannelMessages (discord: Discord, channelId: Snowflake, messageId?: Snowflake): Promise<DiscordAPI.Message[] | DiscordAPI.Message>;
  getActivityInstance (discord: Discord, applicationId: Snowflake, instanceId: Snowflake): Promise<ActivityInstance>;
}

// const getChannelStructure = async (guildId: Snowflake) => {
//   try {
//     const channels = unwrapResponse(
//       await discordApi.getGuildChannels(discord, guildId),
//       `Failed to get channels for guild ${guildId}`,
//     ) as Channel[];
//     const channelStructure = {} as { [channelId: string]: Channel; };
//     for (let i = 0; i < channels.length; i++) {
//       if (!channels[i].guild_id || channels[i].guild_id === "") {
//         Object.defineProperty(channels[i], "guild_id", {
//           value: guildId,
//           enumerable: false,
//         });
//       }
//       channelStructure[channels[i].id] = channels[i];
//       if (!discord) continue;
//       await handleClientDoc({ data: channels[i], guildId, channelId: channels[i].id, discord });
//     }
//     return channelStructure;
//   } catch (err) {
//     console.error("Failed to get channels for guild", guildId, ":", err);
//     return {
//       level: "error",
//       message: `Failed to get channels for guild ${ guildId }: ${ err instanceof Error ? err.message : String(err) }`,
//     };
//   }
// }
// const getGuild = async (id: Snowflake) => {
//   try {
//     // Get the guild data
//     const guild = await discordPost<APIGuild>(`/guilds/${ id }`, {
//       headers: { Authorization: `Bearer ${ access_token }` }
//     });
//     await handleClientDoc({ data: guild, guildId: id });
//     // Get channels for the guild
//     const channels = await getChannelStructure(id, access_token);
//     // Add channels to guild object
//     Object.defineProperty(guild, "channels", {
//       value: channels,
//       enumerable: true,
//     });
//     await handleClientDoc({ data: guild, guildId: id });
//     return guild as Guild;
//   } catch (err) {
//     console.error("Failed to get guild", id, ":", err);
//     return {
//       level: "error",
//       message: `Failed to get guild ${ id }: ${ err instanceof Error ? err.message : String(err) }`,
//     };
//   }
// };

const getGuild = async (discord: Discord, id: Snowflake) => {
  return unwrapResponse(
    await discordApi.getGuild(discord, id),
    `Failed to get guild ${id}`,
  ) as Guild;
}


const getGuilds: GetGuildsFn = async (discord: Discord) => {
  const guilds = unwrapResponse(
    await discordApi.getGuilds(discord),
    "Failed to get guilds for current user",
  );
  for (let i = 0; i < guilds.length; i++) {
    const guildId = guilds[i].id;
    discord.auth.user.guilds[guildId] = guilds[i];
  }
  return guilds
};

const getGuildPreview: GetGuildPreviewFn = async (discord: Discord, guildId: Snowflake) =>
  unwrapResponse(await discordApi.getGuildPreview(discord, guildId), `Failed to get guild ${guildId} preview`);

const getGuildMembers: GetGuildMembersFn = async (discord: Discord, guildId: Snowflake, userId?: Snowflake) =>
  unwrapResponse(await discordApi.getGuildMembers(discord, guildId, userId), `Failed to get guild ${guildId} members`);

const searchGuildMembers: SearchGuildMembersFn = async (discord: Discord, guildId: Snowflake, query: string) =>
  unwrapResponse(await discordApi.searchGuildMembers(discord, guildId, query), `Failed to search guild ${guildId} members`);

const getGuildRoles: GetGuildRolesFn = async (discord: Discord, guildId: Snowflake, roleId?: Snowflake) =>
  unwrapResponse(await discordApi.getGuildRoles(discord, guildId, roleId), `Failed to get guild ${guildId} roles`);

const getGuildRoleMemberCounts: GetGuildRoleMemberCountsFn = async (discord: Discord, guildId: Snowflake) =>
  unwrapResponse(await discordApi.getGuildRoleMemberCounts(discord, guildId), `Failed to get guild ${guildId} role member counts`);

const getChannels: GetChannelsFn = async (discord: Discord, id: Snowflake) =>
  (unwrapResponse(await discordApi.getGuildChannels(discord, id), `Failed to get channels for guild ${id}`) as Channel[]);

const getChannel: GetChannelFn = async (discord: Discord, id: Snowflake) =>
  unwrapResponse(await discordApi.getChannel(discord, id), `Failed to get channel ${id}`);

const getChannelMessages: GetChannelMessagesFn = async (discord: Discord, channelId: Snowflake, messageId?: Snowflake) =>
  unwrapResponse(
    await discordApi.getChannelMessages(discord, channelId, messageId),
    `Failed to get message${messageId ? ` ${messageId}` : "s"} for channel ${channelId}`,
  );

const getVoiceState: GetVoiceStateFn = async (discord: Discord, guildId: Snowflake, userId: Snowflake | "@me" = "@me") =>
  unwrapResponse(await discordApi.getGuildVoiceState(discord, guildId, userId), `Failed to get voice state for guild ${guildId}`);

const getActivityInstance: GetActivityInstanceFn = async (discord: Discord, applicationId: Snowflake, instanceId: Snowflake) =>
  unwrapResponse(
    await discordApi.getActivityInstance(discord, applicationId, instanceId),
    `Failed to get activity instance ${instanceId} for application ${applicationId}`,
  );

export const guilds: Guilds = {
  getGuild,
  getGuilds,
  getGuildPreview,
  getGuildMembers,
  searchGuildMembers,
  getGuildRoles,
  getGuildRoleMemberCounts,
  getChannel,
  getChannelMessages,
  getChannels,
  getVoiceState,
  getActivityInstance,
};

export default guilds;
