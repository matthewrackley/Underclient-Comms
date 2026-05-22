import type { ReactNode } from "react";
import styled from "styled-components";

interface DrawerProps {
  isOpen: boolean;
  children: ReactNode;
}

const Shell = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: min(320px, 80vw);
  height: 100vh;
  background: ${({ theme }) => theme.color.surface};
  border-left: 1px solid ${({ theme }) => theme.color.border};
  padding: ${({ theme }) => theme.space.lg};
  transform: translateX(${({ $open }) => ($open ? "0" : "100%")});
  transition: transform 0.2s ease;
`;

export const Drawer = ({ isOpen, children }: DrawerProps) => <Shell $open={isOpen}>{children}</Shell>;
