import { Router } from "express";
import { handleDoc } from "$/helpers/handleDoc";
import bot from "$/bot/index.js";

interface DiscordFetchOptions {
  init?: RequestInit;
  Authorization?: `Bearer ${string}` | `Bot ${string}`;
  discord?: Discord;
}
type ErrorMessenger = (response: Response) => string;
type DiscordFetch = <T>(route: string, endpoint: string, error?: ErrorMessenger, options?: DiscordFetchOptions) => Promise<APIResponse<T>>;
type Appendable = DiscordAPI.Guild | DiscordAPI.Channel | DiscordAPI.User | Private;
type PropToAppend<T extends Appendable> = T extends DiscordAPI.Guild ? "channels" : T extends DiscordAPI.Channel | Private ? T extends DiscordAPI.Channel ? "privates" | "messages" : "messages" : T extends DiscordAPI.User ? "privates" : never;
type Appended<A extends Appendable, T extends PropToAppend<A>> = T extends "privates" ? A extends DiscordAPI.User ? string[] : Private[] : T extends "channels" ? DiscordAPI.Channel[] : T extends "messages" ? Message[] : never;
type Defined<T extends Appendable> = T extends DiscordAPI.User ? (DiscordAPI.User & { privates: string[] }) : T extends DiscordAPI.Guild ? Guild : T extends DiscordAPI.Channel ? Channel : Private;
type DefineProps = <T extends Appendable, P extends PropToAppend<T> = PropToAppend<T>>(obj: T, prop: P, value?: Appended<T, P>) => Defined<T>;
type AssignProps = <T extends Appendable, P extends PropToAppend<T> = PropToAppend<T>, A extends Appended<T, P> = Appended<T,P>>(obj: T, prop: P, value: (A & string[]) | { [id: string]: A[number]; }) => Defined<T>;

const discordFetch: DiscordFetch = async <T> (route: string, endpoint: string, error: ErrorMessenger = (resp) => `Discord API error: ${resp.status} ${resp.statusText}`, options: DiscordFetchOptions = {}) => {
  const { init = {}, Authorization, discord } = options;
  const headers = {
    "Authorization": Authorization || `${bot.token ? "Bot" : "Bearer"} ${bot.token ? bot.token : discord ? discord.auth.access_token : ""}`,
    "Content-Type": "application/json",
    ...(init.headers ?? {}),
  };
  const response = await fetch(`https://discord.com/api/v10${route}${endpoint}`, { ...init, headers });
  if (!response.ok) {
    return { ok: false, error: error(response) } as APIResponse<T>;
  }
  return { ok: true, data: await response.json() } as APIResponse<T>;
};

function isUser (data: unknown): data is DiscordAPI.User {
  return typeof data === "object" && data !== null && "username" in data && "id" in data && "global_name" in data;
};

const assignProp: AssignProps = (obj, prop, value) => {
  Object.defineProperty(obj, prop, {
    value,
    enumerable: true,
  });
  return obj as any;
};

const defineProp: DefineProps = <T extends Appendable, P extends PropToAppend<T> = PropToAppend<T>, A extends Appended<T,P> = Appended<T,P>>(obj: T, prop: P, value?: A) => {
  if (!Array.isArray(value) || value.length === 0) {
    return assignProp(obj, prop, isUser(obj) && prop === "privates" ? [] as any : {});
  }
  if (prop === "privates" && isUser(obj)) {
    return assignProp(obj, prop, value as any)
  }
  const newProp = {} as { [id: string]: A[number]; };
  for (const key in value) {
    newProp[key] = value[key];
  }
  return assignProp(obj, prop, newProp);
};

const getActivityInstance = async (applicationId: string, instanceId: string, options: DiscordFetchOptions = {}) => await discordFetch<ActivityInstance>("/applications", `/${ applicationId }/activity-instances/${ instanceId }`, (resp) => `Failed to get activity instance: ${ resp.status } ${ resp.statusText }`, options);

const guildFetch = async <T> (endpoint: string, error: ErrorMessenger = (resp) => `Discord API error: ${resp.status} ${resp.statusText}`, options: DiscordFetchOptions = {}) => await discordFetch<T>(`/guilds`, endpoint, error, options);

const channelFetch = async <T> (endpoint: string, error: ErrorMessenger = (resp) => `Discord API error: ${resp.status} ${resp.statusText}`, options: DiscordFetchOptions = {}) => await discordFetch<T>(`/channels`, endpoint, error, options);

const usersFetch = async <T> (endpoint: string, error: ErrorMessenger = (resp) => `Discord API error: ${resp.status} ${resp.statusText}`, options: DiscordFetchOptions = {}) => await discordFetch<T>(`/users`, endpoint, error, options);

function buildUserRoute () {
  const userRoute = Router();

  userRoute.get("{/:userId}", async (req, res) => {
    let { userId = "@me" } = req.params;
    const Authorization = userId === "@me" ? req.get("Authorization") as `Bearer ${ string }` | undefined || req.get("X-Auth-Bearer-Token") as `Bearer ${ string }` : `Bot ${ bot.token }` as const;
    if (userId === "@me" && Authorization.startsWith("Bot ")) {
      return res.status(400).json({ error: "Bot tokens cannot be used to fetch the authenticated user. Please provide a user ID or use a Bearer token." });
    }
    if (userId !== "@me" && Authorization.startsWith("Bearer ")) {
      return res.status(400).json({ error: "Bearer token should not be included when providing a user ID." });
    }
    const data = await usersFetch<DiscordAPI.User>(`/${ userId }`, (resp) => `Failed to get ${ userId === "@me" ? "self" : `user ${ userId }` }: ${ resp.status } ${ resp.statusText }`, { Authorization });
    let user = data.ok && data.data ? data.data : null;
    let user_id = req.get("X-Auth-User-Id") as string | undefined;
  });

  userRoute.get("/@me/guilds", async (req, res) => {

    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await usersFetch<DiscordAPI.Guild[]>("/@me/guilds", (resp) => `Failed to get guilds for self: ${ resp.status } ${ resp.statusText }`, { Authorization });
    console.log(data);
    res.status(data.ok ? 200 : 500).json(data);
  });
  return userRoute;
}

//___=============================>                <============================___\\
//___|| ==================== ||      GUILD ROUTES      || =================== ||___\\
//___=============================>                <============================___\\


function buildGuildRoute () {
  const guildRoute = Router();
  guildRoute.get("/:guildId", async (req, res) => {
    const { guildId } = req.params;
    const Authorization = `Bot ${ bot.token }` as const;
    const data = await guildFetch<DiscordAPI.Guild>(`/${ guildId }`, (resp) => `Failed to get guild ${ guildId }: ${ resp.status } ${ resp.statusText }`, { Authorization });
    if (data.ok && data.data) {
      const channels = await guildFetch<DiscordAPI.Channel[]>(`/${ guildId }/channels`, (resp) => `Failed to get channels for guild ${ guildId }: ${ resp.status } ${ resp.statusText }`, { Authorization });
      if (channels.ok) {
        for (let i = 0; i < channels.data?.length; i++) {

          const messages = await handleDoc<Message[]>("GET", { guildId, channelId: channels.data[i].id, wantsDocs: true });
          channels.data[i] = defineProp(channels.data[i], "messages", messages);
          channels.data[i] = defineProp(channels.data[i], "privates", []);
        }
      }
      data.data = defineProp(data.data, "channels", channels.data);
    }
    return res.status(data.ok ? 200 : 500).json(data)
  });

  guildRoute.get("/:guildId/preview", async (req, res) => {
    const { guildId } = req.params;
    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await guildFetch<DiscordAPI.GuildPreview>(`/${ guildId }/preview`, (resp) => `Failed to get guild ${ guildId } preview: ${ resp.status } ${ resp.statusText }`, { Authorization });
    return res.status(data.ok ? 200 : 500).json(data);
  });

  guildRoute.get("/:guildId/channels", async (req, res) => {
    const { guildId } = req.params;
    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await guildFetch<DiscordAPI.Channel[]>(`/${ guildId }/channels`, (resp) => `Failed to get guild ${ guildId }: ${ resp.status } ${ resp.statusText }`, { Authorization });
    if (data.ok && data.data) {
      for (let i = 0; i < data.data.length; i++) {
        let messages = await handleDoc<Message[]>("GET", { guildId, channelId: data.data[i].id, wantsDocs: true });
        data.data[i] = defineProp(data.data[i], "messages", messages);
        data.data[i] = defineProp(data.data[i], "privates", []);
      }
    }
    return res.status(data.ok ? 200 : 500).json(data);
  });

  guildRoute.get("/:guildId/members{/:userId}", async (req, res) => {
    const { guildId, userId } = req.params;
    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await guildFetch<DiscordAPI.GuildMember[] | DiscordAPI.GuildMember>(`/${ guildId }/members${userId ? `/${userId}` : ""}`, (resp) => `Failed to get member${userId ? ` ${userId}` : "s"} for guild ${ guildId }: ${ resp.status } ${ resp.statusText }`, { Authorization });
    return res.status(data.ok ? 200 : 500).json(data);
  });

  guildRoute.get("/:guildId/members/search", async (req, res) => {
    const { guildId } = req.params;
    const { query } = req.query;
    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await guildFetch<DiscordAPI.GuildMember>(`/${ guildId }/members/search?query=${query}`, (resp) => `Failed to get members for guild ${ guildId }: ${ resp.status } ${ resp.statusText }`, { Authorization });
    return res.status(data.ok ? 200 : 500).json(data);
  });

  guildRoute.get("/:guildId/roles{/:roleId}", async (req, res) => {
    const { guildId, roleId } = req.params;
    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await guildFetch<DiscordAPI.Role | DiscordAPI.Role[]>(`/${ guildId }/roles${roleId ? `/${roleId}` : ""}`, (resp) => `Failed to get role${roleId ? ` ${roleId}` : "s"} for guild ${ guildId }: ${ resp.status } ${ resp.statusText }`, { Authorization });
    return res.status(data.ok ? 200 : 500).json(data);
  });

  guildRoute.get("/:guildId/roles/member-counts", async (req, res) => {
    const { guildId } = req.params;
    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await guildFetch <{ [roleId: Snowflake]: number }>(`/${ guildId }/roles/member-counts`, (resp) => `Failed to get member count for each role: ${ resp.status } ${ resp.statusText }`, { Authorization });
    return res.status(data.ok ? 200 : 500).json(data);
  });

  guildRoute.get("/:guildId/voice-states{/:userId}", async (req, res) => {
    const { guildId, userId = "@me" } = req.params;
    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await guildFetch<DiscordAPI.VoiceState>(`/${ guildId }/voice-states/${userId}`, (resp) => `Failed to get voice-state for ${userId === "@me" ? "self" : `user ${userId}`} in guild ${ guildId }: ${ resp.status } ${ resp.statusText }`, { Authorization });
    return res.status(data.ok ? 200 : 500).json(data);
  });

  return guildRoute;
}

//___=============================>                 <============================___\\
//___|| ==================== ||      CHANNEL ROUTE      || =================== ||___\\
//___=============================>                 <============================___\\


function buildChannelRoute () {
  const channelRoute = Router();

  channelRoute.get("/:channelId", async (req, res) => {
    const { channelId } = req.params;
    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await channelFetch<DiscordAPI.Channel>(`/${ channelId }`, (resp) => `Failed to get channel ${ channelId }: ${ resp.status } ${ resp.statusText }`, { Authorization });
    if (data.ok && data.data.guild_id) {
      const messages = await handleDoc<Message[]>("GET", { guildId: data.data.guild_id, channelId, wantsDocs: true });
      data.data = defineProp(data.data, "messages", messages);
      data.data = defineProp(data.data, "privates", []);
    }
    return res.status(data.ok ? 200 : 500).json(data);
  });

  channelRoute.get("/:channelId/messages{/:messageId}", async (req, res) => {
    const { channelId, messageId } = req.params;
    const Authorization = req.get("Authorization") as `Bearer ${ string }` | undefined || `Bot ${ bot.token }`;
    const data = await channelFetch<DiscordAPI.Message>(`/${ channelId }/messages${messageId ? `/${messageId}` : ""}`, (resp) => `Failed to get channel ${ channelId } message${messageId ? ` ${messageId}` : "s"}: ${ resp.status } ${ resp.statusText }`, { Authorization });
    return res.status(data.ok ? 200 : 500).json(data);
  });
  return channelRoute;
}


//___=============================>              <============================___\\
//___|| ==================== ||      BASE ROUTE      || =================== ||___\\
//___=============================>              <============================___\\


function buildRoute () {
  const apiDiscord = Router();

  apiDiscord.get("/applications/:applicationId/activity-instances/:instanceId", async (req, res) => {
    const { applicationId, instanceId } = req.params;
    const data = await getActivityInstance(applicationId, instanceId);
    return res.status(data.ok ? 200 : 500).json(data);
  });

  const guildRoute = buildGuildRoute();
  const channelRoute = buildChannelRoute();
  const userRoute = buildUserRoute();

  apiDiscord.use("/guilds", guildRoute);
  apiDiscord.use("/channels", channelRoute);
  apiDiscord.use("/users", userRoute);

  return apiDiscord;
}

export const apiDiscord = buildRoute();

export default apiDiscord;
