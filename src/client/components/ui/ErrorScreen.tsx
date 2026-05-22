import styled from "styled-components";
import { Button } from "./Button";

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
  padding: 20px 28px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.color.surfaceAlt};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  border: 1px solid ${({ theme }) => theme.color.border};
  max-width: 420px;
  text-align: center;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

const Message = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.color.textSubtle};
  word-break: break-word;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

type Props = {
  error?: Error;
  onRetry?: () => void;
};

const ErrorScreen: React.FC<Props> = ({ error, onRetry }) => {
  if (!error) return null;

  console.warn("ERROR:", error, "\n\nCAUSE:", error.cause, "\n\nSTACK:", error.stack, "\n\nCAPTURED STACK TRACE:", Error.captureStackTrace(error));
  return (
    <Wrapper>
      <Card>
        <Title>Initialization failed</Title>
        <Message>{error.message}</Message>
        <Actions>
          <Button $variant="outline" $size="md" onClick={() => window.location.reload()}>Reload</Button>
          {onRetry ? (
            <Button $variant="primary" $size="md" onClick={onRetry}>Retry</Button>
          ) : null}
        </Actions>
      </Card>
    </Wrapper>
  );
};

export default ErrorScreen;
