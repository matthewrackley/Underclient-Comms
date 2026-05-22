import { Timestamp } from "firebase/firestore";
import handleClientDoc from "./handleClientDoc";

function isPasscode(privateChannel: unknown): privateChannel is Partial<Private> & { passcode: Passcode } {
  if (typeof privateChannel !== "object" || !privateChannel) return false;
  if (!("passcode" in privateChannel) || !privateChannel.passcode || typeof privateChannel.passcode !== "number") return false;
  if (privateChannel.passcode < 1000 || privateChannel.passcode > 999999) return false;
  return true;
}

function isInviteCode(privateChannel: unknown): privateChannel is Partial<Private> & { inviteCode: InviteCode } {
  if (typeof privateChannel !== "object" || !privateChannel) return false;
  if (!("inviteCode" in privateChannel) || !privateChannel.inviteCode || typeof privateChannel.inviteCode !== "string") return false;
  if (privateChannel.inviteCode.length < 6 || privateChannel.inviteCode.length > 10) return false;
  return true;
}

function isPartialPrivate(object: unknown): object is PartialPrivate {
  if (typeof object !== "object" || !object) return false;
  if (!("id" in object) || !object.id || typeof object.id !== "string") return false;
  return isPasscode(object) && isInviteCode(object);
}
function handlePrivateError(object: unknown): asserts object is PartialPrivate {
  if (!isPartialPrivate(object)) {
    if (typeof object !== "object" || !object) {
      throw new Error("Invalid private channel data: not an object");
    }
    if (!isPasscode(object)) {
      throw new Error("Invalid private channel data: invalid passcode");
    }
    if (!isInviteCode(object)) {
      throw new Error("Invalid private channel data: invalid invite code");
    }
  }
}

//___=============================>                       <============================___\\
//___|| ==================== ||      PRIVATE COLLECTIONS      || =================== ||___\\
//___=============================>                       <============================___\\

async function modPrivate (discord: Discord, guildId: string, channelId: string, data: Private | Partial<Private>): Promise<Private | undefined>;
async function modPrivate (discord: Discord, data: Private | Partial<Private>, userId?: string): Promise<undefined | Private>;
async function modPrivate (discord: Discord, first: string | Private | Partial<Private>, second?: string, privateData?: Private | Partial<Private>): Promise<Private | undefined> {
  let data: Private | Partial<Private> | undefined;
  let userId: string | undefined;
  if (discord === null) {
    throw new Error("Discord SDK not initialized");
  }
  if (typeof first === "object" && isPartialPrivate(first)) {
    data = first;
    if (second && typeof second === "string" && second === discord.auth.user.id) {
      userId = second;
    }
  }
  if (data) {
    handlePrivateError(data);
  }
  if ((typeof first === "string" && typeof second === "string") ||
    data && ((userId && data.owner) || (data.guildId && data.channelId))
  ) {
    if (data) {
      if (data.owner && userId && data.owner === userId) {
        const response = await handleClientDoc<Authenticated>("GET", { root: "users", userId, discord });
        if (response.ok) {
          if (!response.data.user.privates) {
            Object.defineProperty(response.data.user, "privates", {
              value: [data.id],
              writable: true,
              enumerable: true,
              configurable: true,
            });
          } else response.data.user.privates.push(data.id);
            await handleClientDoc({ data: response.data.user, root: "users", userId: response.data.user.id, discord, method: "POST" });
        }
      }
    }
    const response = await handleClientDoc<Private>("GET", { guildId: data?.guildId, channelId: data?.channelId, messageId: data?.id, discord, passcode: data?.passcode, inviteCode: data?.inviteCode, kind: "privates" });
    if (response.ok) {
      return response.data;
    } else {
      throw new Error("Failed to create or update private channel");
    }
  }
}
const accessPrivate = async (discord: Discord, guildId: string, channelId: string, access: {
  passcode: number;
  inviteCode: string;
}) => {
  if (!isPasscode(access)) {
    throw new Error("Invalid passcode. Passcode must be a 4 to 6 digit number.");
  }
  if (!isInviteCode(access)) {
    throw new Error("Invalid invite code. Invite code must be a 6 to 10 character string.");
  }
  if (discord === null) {
    throw new Error("Discord SDK not initialized");
  }
  const privates = await handleClientDoc<Private>("GET", { guildId, channelId, discord, passcode: access.passcode, inviteCode: access.inviteCode, kind: "privates" });
  return privates.ok ? privates.data : undefined;
}
const privates = {
  mod: modPrivate,
  access: accessPrivate,
}

//___=============================>                       <============================___\\
//___|| ==================== ||      MESSAGE COLLECTIONS      || =================== ||___\\
//___=============================>                       <============================___\\

interface MessageRequest {
  guildId: string;
  channelId: string;
  privateId?: string;
  messageId: string;
}
interface MessageData {
  data: Message;
  request: MessageRequest;
}
function constructMessage (data: BaseMessage): Message {
  if (!data.guildId || !data.channelId || !data.content || !data.author) {
    throw new Error("Missing required fields: guildId, channelId, content, and author are required.");
  }
  const message = {
    ...data,
    expiresAt: Timestamp.fromMillis(Timestamp.now().toMillis() + (data.privateId ? 1 : 7) * 24 * 60 * 60 * 1000),
  } as Message;
  return message ;
}
const postMessage = async (discord: Discord, post: BaseMessage) => {
  const data = constructMessage(post);
  const response = await handleClientDoc({ data, guildId: data.guildId, channelId: data.channelId, privateId: data.privateId, messageId: data.id, discord: discord!, method: "POST" });
  return response.ok;
};
const getMessage = async (discord: Discord, guildId: string, channelId: string, id: string, privateId?: string) => {
  const response = await handleClientDoc<Message>("GET", { guildId, channelId, privateId, messageId: id, discord });
  return response.ok ? response.data : undefined;
};

const getAllMessages = async (guildId: string, channelId: string, discord: Discord, privateId?: string) => {
  const response = await handleClientDoc<Message[]>("GET", { guildId, channelId, discord, privateId, wantsDocs: true, method: "GET" });
  return response.ok ? response.data : [];
};

const messages = {
  post: postMessage,
  get: getMessage,
  getAll: getAllMessages,
};

const db = {
  messages,
  privates
}




export default db;
