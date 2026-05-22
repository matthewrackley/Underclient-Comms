import styled from 'styled-components';

const Anchor = styled.a`
  border-radius: 18px;
  border-width: 2px;
  text-align: center;
  padding: 0.5rem 1rem 0.6rem;
  border-style: solid;
  border-color: ${({ theme }) => theme.color.border};
  color: ${({ theme }) => theme.color.link};
  background-color: ${({ theme }) => theme.color.surface};
  transition: 0.2s;
  &:hover {
    color: ${({ theme }) => theme.color.focus};
    cursor: pointer;
  }
`
const Border = styled.div`
  border-width: 2px;
  padding: 2px;
  border-color: ${({theme}) => theme.color.accent};
`


const Link: React.FC<{ href: string; textContent: string }> = ({ href, textContent }) => {
  return (
      <Border>
        <Anchor href={ href }  >{ textContent }</Anchor>
      </Border>
  )
};

export default Link;
