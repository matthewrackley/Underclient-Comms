import styled from "styled-components";
import { Button } from "../ui/Button";

interface LockedStateProps {
  joined: boolean;
  onJoin?: () => void;
}

const Wrapper = styled.div`
  flex: 1;
  display: grid;
  place-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.space.xl};
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.font.display};
  margin: 0 0 ${({ theme }) => theme.space.sm};
`;

const Description = styled.p`
  margin: 0 0 ${({ theme }) => theme.space.lg};
  color: ${({ theme }) => theme.color.textMuted};
`;

export const LockedState = ({ joined = true, onJoin }: LockedStateProps) => joined === false && (
  <Wrapper>
    <div>
      <Title>Voice Gate Active</Title>
      <Description>Join the channel's voice room to access this chat.</Description>
      <Button onClick={onJoin}>I joined voice</Button>
    </div>
  </Wrapper>
);
