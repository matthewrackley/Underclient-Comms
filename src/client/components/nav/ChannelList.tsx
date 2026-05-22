import styled from "styled-components";


interface ChannelListProps {
  items: Channel[];
  channelId: string;
  onSelect: React.Dispatch<React.SetStateAction<Snowflake>>;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
`;

const Row = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ $active, theme }) => ($active ? theme.color.bgGlow : "transparent")};
  color: ${({ theme }) => theme.color.text};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: ${({ theme }) => theme.space.sm};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
`;

const Badge = styled.span`
  background: ${({ theme }) => theme.color.accent};
  color: #120b07;
  border-radius: ${({ theme }) => theme.radius.pill};
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
`;

export const ChannelList = ({ items, channelId, onSelect }: ChannelListProps) => (
  <List>
    { items.map((item) =>
      item.type === 2 && (
        <Row key={ item.id } $active={ item.id === channelId } onClick={ () => onSelect(item.id) }>
          <span>#{ item.name }</span>
        </Row>
      )
    )}
  </List>
);
