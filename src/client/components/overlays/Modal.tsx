import type { ReactNode } from "react";
import styled from "styled-components";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 8, 12, 0.7);
  display: grid;
  place-items: center;
`;

const Panel = styled.div`
  width: min(480px, 90vw);
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.space.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
`;

const Title = styled.h2`
  margin: 0 0 ${({ theme }) => theme.space.sm};
  font-family: ${({ theme }) => theme.font.display};
`;

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <Backdrop onClick={onClose}>
      <Panel onClick={(event) => event.stopPropagation()}>
        {title ? <Title>{title}</Title> : null}
        {children}
      </Panel>
    </Backdrop>
  );
};
