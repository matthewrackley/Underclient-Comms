import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from "node:path";
import { WebSocketServer, WebSocket } from 'ws';
import { handleDoc } from '$/helpers/handleDoc';
import { Timestamp } from 'firebase/firestore';
import { discord } from './controllers';
dotenv.config();


const useHttps = process.env.NODE_ENV === "production" ? true : false;
const app = express();
const http = useHttps
  ? https.createServer({
      key: fs.readFileSync(process.env.HTTPS_KEY_PATH!),
      cert: fs.readFileSync(process.env.HTTPS_CERT_PATH!),
    }, app)
  : createServer(app);
const wss = new WebSocketServer({ server: http });
type ActivityConnection = {
  guildId?: string;
  channelId?: string;
  userId?: string;
  inVoice?: boolean;
  voiceChannelId?: string | null;
};
const connectionMeta = new Map<WebSocket, ActivityConnection>();
const broadcast = (event: string, payload: unknown) => {
  const message = JSON.stringify({ event, payload });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
};

const sendEvent = (client: WebSocket, event: string, payload: unknown) => {
  if (client.readyState !== WebSocket.OPEN) return;
  client.send(JSON.stringify({ event, payload }));
};

const broadcastToGuild = (guildId: string, event: string, payload: unknown) => {
  for (const [client, meta] of connectionMeta) {
    if (meta.guildId !== guildId) continue;
    sendEvent(client, event, payload);
  }
};

wss.on("connection", (socket) => {
  connectionMeta.set(socket, {});

  socket.on("message", (raw) => {
    const text = typeof raw === "string" ? raw : raw.toString();
    let message: { event?: string; payload?: any } | null = null;
    try {
      message = JSON.parse(text) as { event?: string; payload?: any };
    } catch {
      return;
    }
    if (!message?.event) return;

    const meta = connectionMeta.get(socket) ?? {};
    const payload = message.payload ?? {};

    if (message.event === "activity:join") {
      meta.guildId = payload.guildId;
      meta.channelId = payload.channelId;
      meta.userId = payload.userId;
      connectionMeta.set(socket, meta);
      return;
    }

    if (message.event === "activity:leave") {
      meta.channelId = undefined;
      connectionMeta.set(socket, meta);
      return;
    }

    if (message.event.startsWith("voice:")) {
      const updateType = message.event.split(":")[1] ?? "update";
      const connected = updateType !== "leave";
      meta.inVoice = connected;
      meta.voiceChannelId = payload.voiceChannelId ?? null;
      connectionMeta.set(socket, meta);

      if (payload.guildId) {
        broadcastToGuild(payload.guildId, "voice:update", {
          guildId: payload.guildId,
          userId: payload.userId,
          voiceChannelId: payload.voiceChannelId ?? null,
          connected,
          updateType,
          activityChannelId: meta.channelId ?? null,
        });
      }
    }
  });

  socket.on("close", () => {
    connectionMeta.delete(socket);
  });
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`);
  });
  next();
});
app.use(express.static(path.join(process.cwd(), "dist/client")));
function constructMessage (data: BaseMessage): Message {
  if (!data.guildId || !data.channelId || !data.content || !data.author) {
    throw new Error("Missing required fields: guildId, channelId, content, and author are required.");
  }
  return {
    ...data,
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromMillis(Timestamp.now().toMillis() + (data.privateId ? 1 : 7) * 24 * 60 * 60 * 1000),
  } as Message;
}
async function resolveRequestUserId(authorization?: string | string[]) {
  const header = Array.isArray(authorization) ? authorization[0] : authorization;
  const token = header?.replace(/^Bearer\s+/i, "");
  if (!token) return undefined;
  const response = await fetch("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return undefined;
  const user = await response.json() as { id?: string };
  return typeof user.id === "string" ? user.id : undefined;
}

interface FilterParams { userId?: string, passcode?: Passcode, inviteCode?: InviteCode, privateId?: string; wantsDocs?: true; }
type FilterResult = {
  status: number;
  error: string;
  ok: false;
  data?: undefined;
} | {
  status: number;
  ok: true;
  data: Private;
  error?: undefined;
};
async function filterPrivates (auth_token: string, authId: string, guildId: string, channelId: string, params: FilterParams) {
  if (!guildId || !channelId) throw new Error("guildId and channelId are required to get private channels");
  if (!auth_token) throw new Error("Authorization token is required to get private channels");
  if (!authId) throw new Error("Authenticated user ID is required to get private channels");
  const { userId, passcode, inviteCode, privateId, wantsDocs } = params;
  const request = { guildId, channelId, kind: "privates", privateId, wantsDocs, userId } as const;
  let privates: Private[] | undefined = await handleDoc<Private[]>("GET", request);
  let filtered: Private[] | undefined;
  let user: Authenticated | undefined;
  let filterResult: FilterResult;
  if (privates) {
    if (userId && authId === userId) user = await handleDoc<Authenticated>("GET", { root: "users", userId });
    if (user) {
      if (user.access_token !== auth_token) {
        filterResult = { status: 403, error: "Forbidden", ok: false as const };
      } else {
        filtered = privates.filter(priv => {
          if (privateId) return priv.id === privateId;
          if (priv.owner === userId) return true;
          if (priv.passcode === passcode && priv.inviteCode === inviteCode) return true;
          return false;
        });
        if (filtered.length > 1 && !privateId) {
          filterResult = { status: 400, error: "Multiple private channels matched. Provide privateId.", ok: false as const };
        } else if (filtered.length === 1) {
          filterResult = { status: 200, ok: true as const, data: filtered[0] };
        } else {
          filterResult = { status: 404, error: "Private channel not found", ok: false as const };
        }
      }
    } else {
      filterResult = { status: 403, error: "Forbidden", ok: false as const };
    }
  } else {
    filterResult = { status: 404, error: "No private channels found for this channel", ok: false as const };
  }
  if (!filterResult.ok) {
    return { status: filterResult.status, error: filterResult.error, ok: false as const };
  } else {
    return { status: 200, ok: true as const, data: filterResult.data };
  }
}
app.post("/api/docs", async (req, res, next) => {
  const tokenRegex = /^Bearer\s+(.+)$/;
  const authHeader = req.headers['X-Auth-Bearer-Token'] as `Bearer ${ string }` | undefined;
  const authId = req.headers['X-Auth-User-Id'] as string | undefined;
  let auth_token: string | undefined;
  if (authHeader && tokenRegex.test(authHeader)) {
    auth_token = authHeader.replace(tokenRegex, "$1");
  }
  const { root, channelId, privateId, messageId, data, wantsDocs, guildId, userId, kind, method, passcode, inviteCode } = req.body as DatabaseRequest<any>;
  const request = { root, channelId, messageId, wantsDocs, guildId, kind };
  if (method === "POST" && messageId) {
    broadcast("message:add", data);
  }
  try {
    if (kind === "privates" && method === "GET" && wantsDocs) {
      const filterResult = await filterPrivates(auth_token!, authId!, guildId!, channelId!, { userId, passcode, inviteCode, privateId, wantsDocs });
      if (!filterResult.ok) {
        return res.status(filterResult.status).json(filterResult);
      } else {
        return res.status(200).json(filterResult);
      }
    } else {
      const docData = method === "POST" ? await handleDoc(req.body) : await handleDoc("GET", req.body);
      return res.status(200).json({ ok: true, data: docData });
    }
  } catch (error) {
    console.error("Error handling document:", error);
    return res.status(500).json({ error: "Internal server error", ok: false });
  }
});

app.get("/api/env", (req, res) => {
  res.json({
    redirect_uri: process.env.NODE_ENV === "production" ? process.env.REDIRECT_URI : process.env.DEV_REDIRECT_URI,
    discord_client_id: process.env.DISCORD_CLIENT_ID,
    firebase_auth_domain: process.env.FIREBASE_AUTH_DOMAIN
  });
});

app.use("/api/discord", discord);

app.post("/api/token", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Missing Discord auth code" });

  const discordResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code
    })
  });
  const { access_token } = await discordResponse.json();
  if (!discordResponse.ok) {
    return res.sendStatus(discordResponse.status);
  }
  return res.send({ access_token });
});

const port = Number(process.env.PORT ?? 3001);

http.listen(port, () => {
  console.log(`Backend running on ${useHttps ? "https" : "http"}://localhost:${port}`);
});
