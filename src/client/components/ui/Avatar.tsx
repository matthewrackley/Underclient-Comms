import styled from "styled-components";

interface AvatarProps {
  $size?: number;
  $src?: string;
}

export const AvatarWrap = styled.div<AvatarProps>`
  width: ${({ $size = 40 }) => `${$size}px`};
  height: ${({ $size = 40 }) => `${$size}px`};
  border-radius: 50%;
  background: ${({ theme }) => theme.color.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.color.border};
  display: grid;
  place-items: center;
  overflow: hidden;
  position: relative;
  font-weight: 700;
  font-family: ${({ theme }) => theme.font.display};
`;

export const AvatarImage = styled.img<AvatarProps>`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const PresenceDot = styled.span<{ $status?: "online" | "idle" | "dnd" | "offline" }>`
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.color.surfaceAlt};
  background: ${({ $status, theme }) => {
    switch ($status) {
      case "online":
        return theme.color.success;
      case "idle":
        return theme.color.accentSoft;
      case "dnd":
        return theme.color.danger;
      default:
        return theme.color.textSubtle;
    }
  }};
`;
