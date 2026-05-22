import { DiscordSDK } from '@discord/embedded-app-sdk';
import { handleClientDoc } from '../database';
function refreshToken (discord: Discord) {
  const expiresSeconds = Number(discord.auth.expires);
  if (!Number.isFinite(expiresSeconds) || expiresSeconds <= 0) {
    return;
  }
  const bufferMs = 30 * 1000;
  const refreshDelay = (expiresSeconds * 1000) - bufferMs;
  const expirationTime = Date.now() + (expiresSeconds * 1000);
  discord.auth.expirationTime = expirationTime;
  setTimeout(async () => {
    if (!discord) return;
    try {
      discord.auth = (await authorizeClient()).auth;
    } catch (err: any) {
      if (err?.code !== 4002) {
        throw err;
      }
    }
  }, Math.max(0, refreshDelay));
}

export async function authorizeClient (): Promise<Discord> {
  let code: string | undefined;
  const discord = {} as Discord;
  const env = await fetch("/api/env", { method: "GET" }).then(res => res.json() as Promise<{ redirect_uri: string, discord_client_id: string; }>);
  if (!env.discord_client_id) throw new Error("DISCORD_CLIENT_ID is not defined in the environment variables.");
  const sdk = new DiscordSDK(env.discord_client_id);
  discord.sdk = sdk as SDK;
  await discord.sdk.ready();
  try {
    ({ code } = await discord.sdk.commands.authorize({
      client_id: env.discord_client_id,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: [
        "identify",
        "guilds",
        "guilds.members.read",
        "email",
        "rpc.voice.read",
        "rpc.activities.write"
      ]
    }));
  } catch (err: any) {
    if (err?.code === 4002 && discord.auth) {
      return discord;
    }
    throw err;
  }
  if (!code) {
    return discord;
  }
  const { access_token } = await (async function () {
    const response = await fetch("/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code
      })
    });
    return await response.json()
  })();
  try {
    discord.auth = await discord.sdk.commands.authenticate({ access_token }) as Authenticated;
  } catch (err: any) {
    if (err?.code !== 4002 || !discord.auth) {
      throw err;
    }
  }
  const data = await handleClientDoc<Authenticated>("GET", { root: "users", userId: discord.auth.user.id, discord, method: "GET" });
  refreshToken(discord);
    if (data.data) {
    if (data.data.user.privates) {
      discord.auth.user.privates = data.data.user.privates;
    }
  } else {
    discord.auth.user.privates = [];
  }
  return discord;
}


export default authorizeClient;
