import { useEffect, useState } from "react";
import guilds from "../api/get";

const useGuild = (discord: Discord | null, id?: string) => {
  const [guild, setServer] = useState<Guild | null>(discord?.guild || null);
  const [guildId, setGuildId] = useState<Snowflake>("" as Snowflake);

  useEffect(() => {
    let cancelled = false;
    if (!discord) return;
    guilds
      .getGuild(discord, guildId)
      .then((data) => {
        if (!cancelled) {
          setServer(data);

        }
      })
      .catch((reason) => {
        if (!cancelled) {
          console.error("Failed to load guild:", reason);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [discord, guildId]);

  const setGuild: React.Dispatch<React.SetStateAction<string>> = (gid: React.SetStateAction<string>) => {
    setGuildId(gid);
  }
  return [guild, guildId, setGuild] as [Guild, Snowflake, React.Dispatch<React.SetStateAction<string>>];
};

export default useGuild;
