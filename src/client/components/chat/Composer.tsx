import { FormEvent, useState } from "react";
import styled from "styled-components";
import { Button } from "../ui/Button";
import { ActionButton } from '../ui/ActionButton';
interface ComposerProps {
  onSend: (value: string) => void;
}

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.space.sm};
  align-items: center;
`;

const Input = styled.textarea`
  resize: none;
  height: 54px;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.surfaceAlt};
  color: ${({ theme }) => theme.color.text};
`;

export const Composer = ({ onSend }: ComposerProps) => {
  const [value, setValue] = useState("");

  function handleKeyDown (event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }


  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Speak your mind..."
        onKeyDown={ handleKeyDown}
      />
      <ActionButton type="submit" name='chatBubble'  ></ActionButton>
    </Form>
  );
};
