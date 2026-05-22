import { useEffect, useState } from "react";
import guilds from "../api/get";

const useChannels = (discord: Discord | null, init?: Guild) => {

  const [channels, setChannels] = useState<Channel[]>([]);
  const [guild, setGuild] = useState<Guild | null>(init || null);

  useEffect(() => {
    let cancelled = false;
    if (!discord) return;
    guilds
      .getChannels(discord, init ? init.id : discord.sdk.guildId!)
      .then((data) => {
        if (!cancelled) {
          setChannels(data);
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          console.error("Failed to load channels:", reason);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [discord, guild]);

  const selectGuild: React.Dispatch<React.SetStateAction<Guild | null>> = (guild: React.SetStateAction<Guild | null>) => {
    setGuild(guild);
  }
  return [channels, guild, selectGuild] as [Channel[], Guild | null, React.Dispatch<React.SetStateAction<Guild | null>>];
};

export default useChannels;
