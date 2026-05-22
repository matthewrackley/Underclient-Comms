import type { ReactNode } from "react";
import styled from "styled-components";

interface ToastProps {
  message: ReactNode;
}

const ToastShell = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${({ theme }) => theme.color.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.radius.md};
`;

export const Toast = ({ message }: ToastProps) => <ToastShell>{message}</ToastShell>;
