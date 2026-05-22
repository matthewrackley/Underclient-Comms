import { Client, GuildMember } from 'discord.js';
import { discord } from '@/client/api';
import dotenv from 'dotenv';
dotenv.config();
const botClient = new Client({
  intents: [
    "Guilds",
    "GuildVoiceStates",
    "GuildMembers",
    "GuildMessages",
    "MessageContent",
    "GuildMessageReactions",
    "GuildMessageTyping",
    "GuildPresences"
  ],
  rest: {
    version: "10",
  }
});

botClient.login(process.env.DISCORD_BOT_TOKEN);

export function handleLoad () {
  let delay = 500;
  let iterations = 0;
  let timeout = false;
  function load () {
    while (iterations < 10) {
      iterations++;
      delay *= 1.5;
      if (discord !== null) {
        timeout = true;
        return discord;
      }
      setTimeout(load, delay);
    }
    timeout = true;
    throw new Error("Failed to load Discord client after multiple attempts.");
  }
  return { userClient: load(), timeout };
}
botClient.on("voiceStateUpdate", async function (prevState, newState) {
  const oldVC = prevState.channelId;
  const newVC = newState.channelId;
  const { userClient, timeout } = handleLoad();
  while (timeout === false) {
    if (userClient || timeout) break;
  }

  if (!oldVC && newVC) {
    if (newState.member?.user.id === userClient.user.user.id && userClient.channel.id === newVC) {
      console.log(`${ newState.member?.user.tag } joined ${ newState.channel?.name ?? "none" }`);
    }
  }
  if (oldVC && !newVC) {
    const user = await botClient.guilds.fetch(newState.guild.id).then(g => g.voiceStates.fetch("@me"));
    user.member?.user.id === userClient.user.user.id
    if (newState.member?.user.id === userClient.user.user.id && newVC === null) {
      console.log(`${ newState.member?.user.tag } left ${ prevState.channel?.name ?? "none" }`);
    }
  }
  if (oldVC && newVC && oldVC !== newVC) {
    console.log(`${ newState.member?.user.tag } moved from ${ prevState.channel?.name ?? "none" } to ${ newState.channel?.name ?? "none" }`);
  }
  const inVC = [] as GuildMember[];
  newState.channel?.members.forEach(member => member.voice?.channelId === newState.channelId && inVC.push(member));
});

export default botClient;
