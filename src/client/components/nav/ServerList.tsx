import styled from "styled-components";
import { AvatarWrap, AvatarImage } from "../ui/Avatar";
import { useState } from 'react';
import guildAPI from '@/client/api';

export interface ServerItem {
  id: string;
  name: string;
  icon?: string;
}

interface ServerListProps {
  items: PartialGuild[];
  discord: Discord;
  guildId: string;
  onSelect: React.Dispatch<React.SetStateAction<Snowflake>>;
}

const Rail = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const RailButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    left: -10px;
    top: 50%;
    width: 4px;
    height: ${({ $active }) => ($active ? "32px" : "0")};
    background: ${({ theme }) => theme.color.accent};
    border-radius: ${({ theme }) => theme.radius.pill};
    transform: translateY(-50%);
    transition: height 0.2s ease;
  }
`;

export const ServerList = ({ items, guildId, discord, onSelect }: ServerListProps) => {
  return (
    <Rail>
      { items.map((item) => (
        <RailButton key={ item.id } $active={ item.id === guildId } onClick={ async () => {
          try {
            const guildId = Object.keys(discord.auth.user.guilds).find(id => id === item.id);
            const guild = guildId ? discord.auth.user.guilds[guildId as any] : null;
            if (guild && guild.channels) {

            }
            const response = await guildAPI.getGuild(discord, item.id);
            onSelect(response.id);
          } catch (error) {
            console.error("Failed to load guild:", error);
          }
        } }>
          <AvatarWrap $size={ 48 }>
            { item.icon ? <AvatarImage src={ `https://cdn.discordapp.com/icons/${ item.id }/${ item.icon }.${ item.icon.startsWith("a_") ? "gif" : "png" }?size=64` } alt={ item.name } /> : item.name.slice(0, 2) }
          </AvatarWrap>
        </RailButton>
      )) }
    </Rail>
  );
};
