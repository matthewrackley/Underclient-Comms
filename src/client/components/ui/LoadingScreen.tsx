import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 32px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.color.surfaceAlt};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  border: 1px solid ${({ theme }) => theme.color.border};
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.color.border};
  border-top-color: ${({ theme }) => theme.color.accent};
  animation: ${spin} 1s linear infinite;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const Subtitle = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.color.textSubtle};
`;

export const LoadingScreen: React.FC<{ title?: string; subtitle?: string }> = ({ title = "Starting up", subtitle = "Connecting to Discord..." }) => {
  return (
    <Wrapper>
      <Card>
        <Spinner />
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </Card>
    </Wrapper>
  );
};

export default LoadingScreen;
