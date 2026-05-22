type QueryValue = string | number | boolean;
type QueryParams = Record<string, QueryValue | QueryValue[] | null | undefined>;

const DISCORD_API_BASE = "/api/discord";

function toSearchParams(query?: QueryParams): string {
  if (!query) return "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
      continue;
    }
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function discordApiGet<T> (discord: Discord, path: string): Promise<APIResponse<T>>;
async function discordApiGet<T> (discord: Discord, path: string, query: QueryParams): Promise<APIResponse<T>>
async function discordApiGet<T> (discord: Discord, path: string, query?: QueryParams): Promise<APIResponse<T>> {
  const Authorization = `Bearer ${ discord.auth.access_token }`;
  const baseHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "X-Auth-Bearer-Token": Authorization,
    "X-Auth-User-Id": discord.auth.user.id,
  }
  let headers: HeadersInit = {};
  if (path.includes("@me")) {
    headers = {
      ...baseHeaders,
      "Authorization": Authorization
    };
  } else {
    headers = baseHeaders;;
  }
  const requestInit = {
    method: "GET",
    headers,
  }
  const response = await fetch(`${DISCORD_API_BASE}${path}${query ? toSearchParams(query) : ""}`, requestInit);

  const data = await response.json() as APIResponse<T>;
  if (typeof data?.ok === "boolean") {
    return data;
  }

  return {
    ok: false,
    error: `Unexpected API response: ${response.status} ${response.statusText}`,
  };
}

export const discordApi = {
  getActivityInstance: (discord: Discord, applicationId: Snowflake, instanceId: Snowflake) =>
    discordApiGet<ActivityInstance>(discord, `/applications/${encodeURIComponent(applicationId)}/activity-instances/${encodeURIComponent(instanceId)}`),

  getGuild: (discord: Discord, guildId: Snowflake) =>
    discordApiGet<DiscordAPI.Guild>(discord, `/guilds/${ encodeURIComponent(guildId) }`),

  getGuilds: (discord: Discord) => discordApiGet<PartialGuild[]>(discord, `/users/@me/guilds`),

  getGuildPreview: (discord: Discord, guildId: Snowflake) =>
    discordApiGet<DiscordAPI.GuildPreview>(discord, `/guilds/${encodeURIComponent(guildId)}/preview`),

  getGuildChannels: (discord: Discord, guildId: Snowflake) =>
    discordApiGet<DiscordAPI.Channel[]>(discord, `/guilds/${encodeURIComponent(guildId)}/channels`),

  getGuildMembers: (discord: Discord, guildId: Snowflake, userId?: Snowflake) =>
    discordApiGet<DiscordAPI.GuildMember[] | DiscordAPI.GuildMember>(
      discord,
      `/guilds/${encodeURIComponent(guildId)}/members${userId ? `/${encodeURIComponent(userId)}` : ""}`,
    ),

  searchGuildMembers: (discord: Discord, guildId: Snowflake, query: string) =>
    discordApiGet<DiscordAPI.GuildMember[]>(discord, `/guilds/${encodeURIComponent(guildId)}/members/search`, { query }),

  getGuildRoles: (discord: Discord, guildId: Snowflake, roleId?: Snowflake) =>
    discordApiGet<DiscordAPI.Role[] | DiscordAPI.Role>(
      discord,
      `/guilds/${encodeURIComponent(guildId)}/roles${roleId ? `/${encodeURIComponent(roleId)}` : ""}`,
    ),

  getGuildRoleMemberCounts: (discord: Discord, guildId: Snowflake) =>
    discordApiGet<Record<Snowflake, number>>(discord, `/guilds/${encodeURIComponent(guildId)}/roles/member-counts`),

  getGuildVoiceState: (discord: Discord, guildId: Snowflake, userId?: Snowflake | "@me") =>
    discordApiGet<DiscordAPI.VoiceState>(
      discord,
      `/guilds/${encodeURIComponent(guildId)}/voice-states${userId ? `/${encodeURIComponent(userId)}` : ""}`,
    ),

  getChannel: (discord: Discord, channelId: Snowflake) =>
    discordApiGet<DiscordAPI.Channel>(discord, `/channels/${encodeURIComponent(channelId)}`),

  getChannelMessages: (discord: Discord, channelId: Snowflake, messageId?: Snowflake) =>
    discordApiGet<DiscordAPI.Message[] | DiscordAPI.Message>(
      discord,
      `/channels/${encodeURIComponent(channelId)}/messages${messageId ? `/${encodeURIComponent(messageId)}` : ""}`,
    ),
  getUser: (discord: Discord, userId: Snowflake) => discordApiGet<DiscordAPI.User>(discord, `/users/${ encodeURIComponent(userId) }`),
  getSelf: (discord: Discord) => discordApiGet<DiscordAPI.User>(discord, `/users/@me`),
};

export default discordApi;
