import { useEffect, useState } from "react";
import guilds from "@/client/api";

const useGuild = (discord: Discord | null, id?: Snowflake) => {
  const [guild, setServer] = useState<Guild | null>(discord?.guild || null);
  const [guildId, setGuildId] = useState<Snowflake>(id || "" as Snowflake);

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

  const setGuild: React.Dispatch<React.SetStateAction<Snowflake>> = (gid: React.SetStateAction<Snowflake>) => {
    setGuildId(gid);
  }
  return [guild, guildId, setGuild] as [Guild, Snowflake, React.Dispatch<React.SetStateAction<Snowflake>>];
};

export default useGuild;
