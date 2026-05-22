import styled from "styled-components";

export const Card = styled.div`
  background: ${({ theme }) => theme.color.surfaceAlt};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.space.md};
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export const CardTitle = styled.div`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

export const CardMeta = styled.div`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 12px;
`;
