import styled, { css } from "styled-components";

export type ButtonVariant = "primary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
}

const sizeStyles = {
  sm: css`
    padding: 6px 12px;
    font-size: 12px;
  `,
  md: css`
    padding: 10px 16px;
    font-size: 14px;
  `,
  lg: css`
    padding: 12px 20px;
    font-size: 16px;
  `
};

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.color.accent};
    color: #120b07;
    border: 1px solid transparent;
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.color.text};
    border: 1px solid transparent;
  `,
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.color.text};
    border: 1px solid ${({ theme }) => theme.color.border};
  `
};

export const Button = styled.button<ButtonProps>`
  border-radius: ${({ theme }) => theme.radius.pill};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  ${({ $size = "md" }) => sizeStyles[$size]};
  ${({ $variant = "primary" }) => variantStyles[$variant]};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadow.soft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const IconButton = styled(Button)`
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
