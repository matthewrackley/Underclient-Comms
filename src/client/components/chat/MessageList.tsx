import { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { AvatarImage, AvatarWrap } from "../ui/Avatar";

interface MessageListProps {
  messages: Message[];
}

const List = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.space.sm};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: ${({ theme }) => theme.space.md};
`;

const Bubble = styled.div`
  background: ${({ theme }) => theme.color.surfaceAlt};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.space.md};
  border: 1px solid ${({ theme }) => theme.color.border};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const Name = styled.span`
  font-weight: 600;
`;

const Time = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Content = styled.p`
  margin: 0;
  line-height: 1.5;
`;

const getMessageTime = (message: Message) => {
  const createdAt = message.createdAt;
  if (!createdAt) return 0;
  const timestampLike = createdAt as {
    toMillis?: () => number;
    seconds?: number;
  };
  if (typeof timestampLike.toMillis === "function") {
    return timestampLike.toMillis();
  }
  if (typeof timestampLike.seconds === "number") {
    return timestampLike.seconds * 1000;
  }
  const parsed = Date.parse(String(createdAt));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatTimestamp = (value: Message["createdAt"]) => {
  if (!value) return "";
  if ("toDate" in value) {
    const date = value.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if ("seconds" in value) { //@ts-ignore TODO: fix this type
    const millis = Number(value.seconds) * 1000;
    return new Date(millis).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return new Date(String(value)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const MessageList = ({ messages }: MessageListProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);

  const orderedMessages = useMemo(
    () => [...messages].sort((left, right) => getMessageTime(left) - getMessageTime(right)),
    [messages],
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list || !shouldStickToBottomRef.current) return;
    list.scrollTop = list.scrollHeight;
  }, [orderedMessages.length]);

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 48;
  };

  return (
    <List ref={listRef} onScroll={handleScroll}>
      {orderedMessages.map((message) => (
        <Row key={message.id}>
          <AvatarWrap $size={ 40 } $src={`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=40`}>
            <AvatarImage src={`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=40`} alt={message.author.username} />
          </AvatarWrap>
          <Bubble>
            <Header>
              <Name>{message.author.global_name || message.author.username || "Unknown"}</Name>
              <Time>{formatTimestamp(message.createdAt)}</Time>
            </Header>
            <Content>{message.content}</Content>
          </Bubble>
        </Row>
      ))}
    </List>
  );
};
